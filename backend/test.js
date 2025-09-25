import qs from 'qs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://atharvayadav11:ashokvaishali@cluster0.twnwnbu.mongodb.net/NFCDatabase?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define Missing Person Schema
const missingPersonSchema = new mongoose.Schema({
  srNo: { type: Number, required: true },
  imageUrl: { type: String, default: null },
  dateOfRegistration: { type: String, required: true },
  nameOfMissingPerson: { type: String, required: true },
  age: { type: Number, required: true },
  incidentPlace: { type: String, required: true },
  policeStation: { type: String, required: true },
  district: { type: String, required: true },
  scrapedAt: { type: Date, default: Date.now },
  searchDateRange: {
    from: String,
    to: String
  }
}, { collection: 'missingPersons' });

// Create model
const MissingPerson = mongoose.model('MissingPerson', missingPersonSchema);

function parseAjaxResponse(responseText) {
    console.log('Parsing AJAX response...');
    console.log('Response type:', typeof responseText);
    console.log('Response contains pipe:', responseText.includes('|'));
    
    // Check if this is a full HTML page instead of AJAX response
    if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
        console.log('Received full HTML page instead of AJAX response');
        return {
            viewState: null,
            eventValidation: null,
            previousPage: null,
            html: null,
            isHtmlPage: true
        };
    }

    const parts = responseText.split('|');
    console.log('AJAX response parts count:', parts.length);
    
    const result = {
        viewState: null,
        eventValidation: null,
        previousPage: null,
        html: null,
        isHtmlPage: false
    };

    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === 'hiddenField' && i + 2 < parts.length) {
            const fieldName = parts[i + 1];
            const fieldValue = parts[i + 2];

            if (fieldName === '__VIEWSTATE') {
                result.viewState = fieldValue;
            } else if (fieldName === '__EVENTVALIDATION') {
                result.eventValidation = fieldValue;
            } else if (fieldName === '__PREVIOUSPAGE') {
                result.previousPage = fieldValue;
            }
        } else if (parts[i] === 'updatePanel' && i + 2 < parts.length) {
            result.html = parts[i + 2];
        }
    }

    console.log('Parsed result:', {
        hasViewState: !!result.viewState,
        hasEventValidation: !!result.eventValidation,
        hasHtml: !!result.html,
        isHtmlPage: result.isHtmlPage
    });

    return result;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility functions for date handling
function formatDateForPortal(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function generateDateRanges(startDate, endDate, maxDaysPerRange = 60) {
    const ranges = [];
    const current = new Date(startDate);
    
    while (current < endDate) {
        const rangeEnd = new Date(current);
        rangeEnd.setDate(rangeEnd.getDate() + maxDaysPerRange - 1);
        
        if (rangeEnd > endDate) {
            rangeEnd.setTime(endDate.getTime());
        }
        
        ranges.push({
            from: new Date(current),
            to: new Date(rangeEnd)
        });
        
        current.setDate(current.getDate() + maxDaysPerRange);
    }
    
    return ranges;
}

// Function to get current date ranges (last 6 months)
function getCurrentDateRanges() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // 6 months back
    
    return generateDateRanges(startDate, endDate, 60);
}

function parseMissingPersons(html) {
    const $ = cheerio.load(html);
    const missingPersons = [];

    $('table.GridTable tr').each((index, element) => {
        if (index === 0) return; // Skip header row

        const columns = $(element).find('td');
        const serialNo = columns.eq(0).text().trim();
        const imageUrl = columns.eq(1).find('img').attr('src');
        const dateOfRegistration = columns.eq(2).text().trim();
        const missingPersonName = columns.eq(3).text().trim();
        const age = columns.eq(4).text().trim();
        const incidentPlace = columns.eq(5).text().trim();
        const policeStation = columns.eq(6).text().trim();
        const district = columns.eq(7).text().trim();

        if (serialNo) {
            missingPersons.push({
                srNo: parseInt(serialNo) || 0,
                imageUrl: imageUrl,
                dateOfRegistration: dateOfRegistration,
                nameOfMissingPerson: missingPersonName,
                age: parseInt(age) || 0,
                incidentPlace: incidentPlace,
                policeStation: policeStation,
                district: district
            });
        }
    });

    return missingPersons;
}

function parseArrestedPersons(html) {
    console.log('Parsing arrested persons data...');
    const $ = cheerio.load(html);
    const arrestedPersons = [];

    $('table.GridTable tr').each((index, element) => {
        if (index === 0) return; // Skip header row

        const columns = $(element).find('td');
        const serialNo = columns.eq(0).text().trim();
        const imageUrl = columns.eq(1).find('img').attr('src');
        const dateOfArrest = columns.eq(2).text().trim();
        const arrestedPersonName = columns.eq(3).text().trim();
        const age = columns.eq(4).text().trim();
        const gender = columns.eq(5).text().trim();
        const policeStation = columns.eq(6).text().trim();
        const personType = columns.eq(7).text().trim(); // Arrested or Surrendered
        const district = columns.eq(8).text().trim();

        if (serialNo) {
            arrestedPersons.push({
                srNo: parseInt(serialNo) || 0,
                imageUrl: imageUrl,
                dateOfArrest: dateOfArrest,
                nameOfArrestedPerson: arrestedPersonName,
                age: parseInt(age) || 0,
                gender: gender,
                policeStation: policeStation,
                district: district,
                personType: personType,
                nationality: 'Indian' // Default value
            });
        }
    });

    console.log(`Parsed ${arrestedPersons.length} arrested persons records`);
    return arrestedPersons;
}

async function getFreshSessionArrested() {
    console.log('Getting fresh session for arrested persons...');
    const response = await axios.get('https://citizen.mahapolice.gov.in/Citizen/MH/SearcgAccusedArrest.aspx', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
    });
    
    // Extract session cookie
    const cookies = response.headers['set-cookie'];
    let sessionCookie = '';
    if (cookies) {
        for (const cookie of cookies) {
            if (cookie.includes('ASP.NET_SessionId')) {
                sessionCookie = cookie.split(';')[0];
                break;
            }
        }
    }
    
    console.log('Session cookie:', sessionCookie);
    return sessionCookie;
}

function parseHtmlForViewState(html) {
    console.log('Parsing HTML for ViewState and other hidden fields...');
    const $ = cheerio.load(html);
    
    const result = {
        viewState: $('input[name="__VIEWSTATE"]').val() || null,
        viewStateGenerator: $('input[name="__VIEWSTATEGENERATOR"]').val() || null,
        eventValidation: $('input[name="__EVENTVALIDATION"]').val() || null,
        previousPage: $('input[name="__PREVIOUSPAGE"]').val() || null,
        viewStateEncrypted: $('input[name="__VIEWSTATEENCRYPTED"]').val() || null
    };
    
    console.log('Extracted fields:', {
        hasViewState: !!result.viewState,
        hasViewStateGenerator: !!result.viewStateGenerator,
        hasEventValidation: !!result.eventValidation,
        hasPreviousPage: !!result.previousPage,
        hasViewStateEncrypted: !!result.viewStateEncrypted
    });
    
    return result;
}

async function submitSearchForm(viewStateData, sessionCookie, dateRange = null) {
    console.log('Submitting search form...');
    
    // Use provided date range or default to current 60-day range
    let fromDate = '1/04/2025';
    let toDate = '25/05/2025';
    
    if (dateRange) {
        fromDate = formatDateForPortal(dateRange.from);
        toDate = formatDateForPortal(dateRange.to);
        console.log(`Using date range: ${fromDate} to ${toDate}`);
    } else {
        console.log(`Using default date range: ${fromDate} to ${toDate}`);
    }
    
    const data = qs.stringify({
        'ctl00$ScriptManager1': 'ctl00$ContentPlaceHolder1$UpdatePanel2|ctl00$ContentPlaceHolder1$btnSearch',
        '__EVENTTARGET': '',
        '__EVENTARGUMENT': '',
        '__LASTFOCUS': '',
        '__VIEWSTATE': viewStateData.viewState,
        '__VIEWSTATEGENERATOR': viewStateData.viewStateGenerator,
        '__VIEWSTATEENCRYPTED': '',
        '__PREVIOUSPAGE': viewStateData.previousPage,
        '__EVENTVALIDATION': viewStateData.eventValidation,
        'ctl00$ContentPlaceHolder1$ddlSearch': 'Select',
        'ctl00$ContentPlaceHolder1$txtInput': 'Search Query',
        'ctl00$hdnSessionIdleTime': '',
        'ctl00$hdnUserUniqueId': '',
        'ctl00$ContentPlaceHolder1$txtDateRangeFrom': fromDate,
        'ctl00$ContentPlaceHolder1$meeDateRangeFrom_ClientState': '',
        'ctl00$ContentPlaceHolder1$txtFirstName': '',
        'ctl00$ContentPlaceHolder1$txtDateRangeTo': toDate,
        'ctl00$ContentPlaceHolder1$meeDateRangeTo_ClientState': '',
        'ctl00$ContentPlaceHolder1$txtMiddleName': '',
        'ctl00$ContentPlaceHolder1$txtAgefrom': '',
        'ctl00$ContentPlaceHolder1$txtAgeTo': '',
        'ctl00$ContentPlaceHolder1$txtLastName': '',
        'ctl00$ContentPlaceHolder1$ddlDistrict': '',
        'ctl00$ContentPlaceHolder1$ddlGender': '',
        'ctl00$ContentPlaceHolder1$ucRecordView$ddlPageSize': '0',
        '__ASYNCPOST': 'true',
        'ctl00$ContentPlaceHolder1$btnSearch': 'Search'
    });

    const config = {
        method: 'post',
        url: 'https://citizen.mahapolice.gov.in/Citizen/MH/SearchView.aspx',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'Cookie': sessionCookie,
            'Origin': 'https://citizen.mahapolice.gov.in',
            'Referer': 'https://citizen.mahapolice.gov.in/Citizen/MH/SearchView.aspx'
        },
        data: data,
        timeout: 30000
    };

    const response = await axios.request(config);
    console.log('Search response status:', response.status);
    console.log('Search response data length:', response.data.length);
    console.log('First 500 chars of search response:', response.data.substring(0, 500));
    
    // If we get HTML response, parse it for ViewState and return the HTML
    if (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html')) {
        console.log('Received HTML response from search, parsing for ViewState...');
        const viewStateData = parseHtmlForViewState(response.data);
        return {
            html: response.data,
            viewStateData: viewStateData,
            isHtmlResponse: true
        };
    }
    
    return response.data;
}

export async function getInitialPage(sessionCookie = null) {
    // If no session cookie provided, get a fresh one
    if (!sessionCookie) {
        sessionCookie = await getFreshSession();
    }
    
    // Set default date values
    const fromDate = '1/04/2025';
    const toDate = '25/05/2025';
    
    const data = qs.stringify({
        'ctl00$ScriptManager1': 'ctl00$ContentPlaceHolder1$UpdatePanel2|ctl00$ContentPlaceHolder1$btnSearch',
        '__EVENTTARGET': '',
        '__EVENTARGUMENT': '',
        '__LASTFOCUS': '',
        '__VIEWSTATE': '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',
        '__VIEWSTATEGENERATOR': 'B97C20CD',
        '__VIEWSTATEENCRYPTED': '',
        '__PREVIOUSPAGE': 'sFyXFVeDTz1Es_u7Nn6OST8z50EYiZXYme1GQTEeRL4SxY7tRUgstEMgis7GFFdSIicMatTpbp82uIpC024zp8ES2guFNPucCmB1ZxgMo0dTLcEX0',
        '__EVENTVALIDATION': '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',
        'ctl00$ContentPlaceHolder1$ddlSearch': 'Select',
        'ctl00$ContentPlaceHolder1$txtInput': 'Search Query',
        'ctl00$hdnSessionIdleTime': '',
        'ctl00$hdnUserUniqueId': '',
        'ctl00$ContentPlaceHolder1$txtDateRangeFrom': fromDate,
        'ctl00$ContentPlaceHolder1$meeDateRangeFrom_ClientState': '',
        'ctl00$ContentPlaceHolder1$txtFirstName': '',
        'ctl00$ContentPlaceHolder1$txtDateRangeTo': toDate,
        'ctl00$ContentPlaceHolder1$meeDateRangeTo_ClientState': '',
        'ctl00$ContentPlaceHolder1$txtMiddleName': '',
        'ctl00$ContentPlaceHolder1$txtAgefrom': '',
        'ctl00$ContentPlaceHolder1$txtAgeTo': '',
        'ctl00$ContentPlaceHolder1$txtLastName': '',
        'ctl00$ContentPlaceHolder1$ddlDistrict': '',
        'ctl00$ContentPlaceHolder1$ddlGender': '',
        'ctl00$ContentPlaceHolder1$ucRecordView$ddlPageSize': '0',
        '__ASYNCPOST': 'true',
        'ctl00$ContentPlaceHolder1$btnSearch': 'Search'
    });

    const config = {
        method: 'post',
        url: 'https://citizen.mahapolice.gov.in/Citizen/MH/SearchView.aspx',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'Cookie': sessionCookie || 'ASP.NET_SessionId=kwxrzmhq0rrv5oboyajyn5mu',
            'Origin': 'https://citizen.mahapolice.gov.in',
            'Referer': 'https://citizen.mahapolice.gov.in/Citizen/MH/SearchView.aspx'
        },
        data: data,
        timeout: 30000
    };

    const response = await axios.request(config);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data length:', response.data.length);
    console.log('First 500 chars of response:', response.data.substring(0, 500));
    
    // If we get HTML response, parse it for ViewState and return the HTML
    if (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html')) {
        console.log('Received HTML response, parsing for ViewState...');
        const viewStateData = parseHtmlForViewState(response.data);
        return {
            html: response.data,
            viewStateData: viewStateData,
            isHtmlResponse: true
        };
    }
    
    return response.data;
}

async function getPageWithAjax(pageNumber, viewStateData, sessionCookie, dateRange = null) {
    // Use provided date range or default
    let fromDate = '1/04/2025';
    let toDate = '25/05/2025';
    
    if (dateRange) {
        fromDate = formatDateForPortal(dateRange.from);
        toDate = formatDateForPortal(dateRange.to);
    }
    
    const data = qs.stringify({
        'ctl00$ScriptManager1': 'ctl00$ContentPlaceHolder1$UpdatePanel2|ctl00$ContentPlaceHolder1$gdvMissingRegistrationdetails',
        '__EVENTTARGET': 'ctl00$ContentPlaceHolder1$gdvMissingRegistrationdetails',
        '__EVENTARGUMENT': `Page$${pageNumber}`,
        '__LASTFOCUS': '',
        '__VIEWSTATE': viewStateData.viewState,
        '__VIEWSTATEGENERATOR': viewStateData.viewStateGenerator || 'EFD4CB67',
        '__VIEWSTATEENCRYPTED': '',
        '__PREVIOUSPAGE': viewStateData.previousPage,
        '__EVENTVALIDATION': viewStateData.eventValidation,
        'ctl00$ContentPlaceHolder1$ddlSearch': 'Select',
        'ctl00$ContentPlaceHolder1$txtInput': 'Search Query',
        'ctl00$hdnSessionIdleTime': '',
        'ctl00$hdnUserUniqueId': '',
        'ctl00$ContentPlaceHolder1$txtDateRangeFrom': fromDate,
        'ctl00$ContentPlaceHolder1$meeDateRangeFrom_ClientState': '',
        'ctl00$ContentPlaceHolder1$txtFirstName': '',
        'ctl00$ContentPlaceHolder1$txtDateRangeTo': toDate,
        'ctl00$ContentPlaceHolder1$meeDateRangeTo_ClientState': '',
        'ctl00$ContentPlaceHolder1$txtMiddleName': '',
        'ctl00$ContentPlaceHolder1$txtAgefrom': '',
        'ctl00$ContentPlaceHolder1$txtAgeTo': '',
        'ctl00$ContentPlaceHolder1$txtLastName': '',
        'ctl00$ContentPlaceHolder1$ddlDistrict': '',
        'ctl00$ContentPlaceHolder1$ddlGender': '',
        'ctl00$ContentPlaceHolder1$ucRecordView$ddlPageSize': '0',
        '__ASYNCPOST': 'true'
    });

    const config = {
        method: 'post',
        url: 'https://citizen.mahapolice.gov.in/Citizen/MH/SearchView.aspx',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'Cookie': sessionCookie,
            'Origin': 'https://citizen.mahapolice.gov.in',
            'Referer': 'https://citizen.mahapolice.gov.in/Citizen/MH/SearchView.aspx'
        },
        data: data,
        timeout: 30000
    };

    const response = await axios.request(config);
    return response.data;
}

// Function to scrape all pages for a given date range
async function scrapeAllPagesForDateRange(dateRange, sessionCookie) {
    const allData = [];
    let currentViewState = null;
    let successfulPages = 0;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;
    const delayBetweenRequests = 2000;
    const maxPagesPerRange = 50; // Limit to prevent infinite loops

    console.log(`🚀 Starting to scrape date range: ${formatDateForPortal(dateRange.from)} to ${formatDateForPortal(dateRange.to)}`);

    try {
        // Step 1: Get initial page (page 1) with search
        console.log('📄 Fetching page 1 (initial search)...');
        const initialResponse = await getInitialPage(sessionCookie);
        
        if (initialResponse.isHtmlResponse) {
            console.log('Received HTML response, submitting search...');
            
            // Submit the search form with date range
            const searchResponse = await submitSearchForm(initialResponse.viewStateData, sessionCookie, dateRange);
            
            if (searchResponse.isHtmlResponse) {
                console.log('Received search results HTML, parsing for data...');
                const searchData = parseMissingPersons(searchResponse.html);
                
                if (searchData.length === 0) {
                    console.log('No data found in search results for this date range.');
                    return [];
                }
                
                // Add date range info to each record
                searchData.forEach(record => {
                    record.searchDateRange = {
                        from: formatDateForPortal(dateRange.from),
                        to: formatDateForPortal(dateRange.to)
                    };
                });
                
                allData.push(...searchData);
                console.log(`✅ Page 1: Found ${searchData.length} records`);
                successfulPages++;
                
                // Update ViewState for next requests
                currentViewState = {
                    viewState: searchResponse.viewStateData.viewState,
                    eventValidation: searchResponse.viewStateData.eventValidation,
                    previousPage: searchResponse.viewStateData.previousPage,
                    viewStateGenerator: searchResponse.viewStateData.viewStateGenerator
                };
            } else {
                // Handle AJAX search response
                const searchParsed = parseAjaxResponse(searchResponse);
                if (searchParsed.html) {
                    const searchData = parseMissingPersons(searchParsed.html);
                    if (searchData.length > 0) {
                        searchData.forEach(record => {
                            record.searchDateRange = {
                                from: formatDateForPortal(dateRange.from),
                                to: formatDateForPortal(dateRange.to)
                            };
                        });
                        allData.push(...searchData);
                        console.log(`✅ Page 1: Found ${searchData.length} records`);
                        successfulPages++;
                        currentViewState = {
                            viewState: searchParsed.viewState,
                            eventValidation: searchParsed.eventValidation,
                            previousPage: searchParsed.previousPage,
                            viewStateGenerator: 'B97C20CD'
                        };
                    }
                }
            }
        }

        // Step 2: Scrape remaining pages if we have ViewState
        if (currentViewState && currentViewState.viewState) {
            for (let pageNum = 2; pageNum <= maxPagesPerRange; pageNum++) {
                try {
                    console.log(`📄 Fetching page ${pageNum}...`);
                    
                    // Add delay to be respectful to the server
                    await delay(delayBetweenRequests);
                    
                    const pageResponse = await getPageWithAjax(pageNum, currentViewState, sessionCookie, dateRange);
                    const pageParsed = parseAjaxResponse(pageResponse);
                    
                    if (!pageParsed.html) {
                        console.log(`⚠️  Page ${pageNum}: Could not parse response - might be end of data`);
                        break;
                    }
                    
                    const pageData = parseMissingPersons(pageParsed.html);
                    
                    if (pageData.length === 0) {
                        console.log(`⚠️  Page ${pageNum}: No data found - reached end of results`);
                        break;
                    }
                    
                    // Add date range info to each record
                    pageData.forEach(record => {
                        record.searchDateRange = {
                            from: formatDateForPortal(dateRange.from),
                            to: formatDateForPortal(dateRange.to)
                        };
                    });
                    
                    allData.push(...pageData);
                    console.log(`✅ Page ${pageNum}: Found ${pageData.length} records (Total: ${allData.length})`);
                    successfulPages++;
                    consecutiveErrors = 0;
                    
                    // Update ViewState for next request
                    if (pageParsed.viewState) {
                        currentViewState.viewState = pageParsed.viewState;
                    }
                    if (pageParsed.eventValidation) {
                        currentViewState.eventValidation = pageParsed.eventValidation;
                    }
                    if (pageParsed.previousPage) {
                        currentViewState.previousPage = pageParsed.previousPage;
                    }
                    
                } catch (error) {
                    consecutiveErrors++;
                    console.error(`❌ Error on page ${pageNum}:`, error.message);
                    
                    if (consecutiveErrors >= maxConsecutiveErrors) {
                        console.log(`💥 Stopping after ${maxConsecutiveErrors} consecutive errors`);
                        break;
                    }
                    
                    console.log(`⏳ Waiting longer before retry... (${consecutiveErrors}/${maxConsecutiveErrors})`);
                    await delay(delayBetweenRequests * 2); // Wait longer after error
                }
            }
        }

        console.log(`\n📊 Date range scraping completed!`);
        console.log(`✅ Successfully scraped ${successfulPages} pages`);
        console.log(`📝 Total records collected: ${allData.length}`);

        return allData;

    } catch (error) {
        console.error('💥 Fatal error in date range scraping:', error.message);
        return allData; // Return whatever data we collected
    }
}

// Main function to scrape multiple date ranges and save to MongoDB
async function scrapeAllMissingPersonsData() {
    console.log('🚀 Starting comprehensive missing persons data collection...');
    
    const dateRanges = getCurrentDateRanges();
    console.log(`📅 Will scrape ${dateRanges.length} date ranges`);
    
    const allCollectedData = [];
    let totalSavedRecords = 0;
    
    for (let i = 0; i < dateRanges.length; i++) {
        const dateRange = dateRanges[i];
        console.log(`\n🔄 Processing date range ${i + 1}/${dateRanges.length}: ${formatDateForPortal(dateRange.from)} to ${formatDateForPortal(dateRange.to)}`);
        
        try {
            // Get fresh session for each date range
            const sessionCookie = await getFreshSession();
            
            // Scrape all pages for this date range
            const rangeData = await scrapeAllPagesForDateRange(dateRange, sessionCookie);
            
            if (rangeData.length > 0) {
                // Save to MongoDB
                console.log(`💾 Saving ${rangeData.length} records to MongoDB...`);
                
                try {
                    const savedRecords = await MissingPerson.insertMany(rangeData, { ordered: false });
                    totalSavedRecords += savedRecords.length;
                    console.log(`✅ Successfully saved ${savedRecords.length} records to MongoDB`);
                } catch (dbError) {
                    if (dbError.code === 11000) {
                        console.log(`⚠️  Some records already exist (duplicate key error) - continuing...`);
                        // Try to save non-duplicate records individually
                        for (const record of rangeData) {
                            try {
                                await MissingPerson.create(record);
                                totalSavedRecords++;
                            } catch (individualError) {
                                // Skip duplicates
                            }
                        }
                    } else {
                        console.error('❌ Database error:', dbError.message);
                    }
                }
                
                allCollectedData.push(...rangeData);
            }
            
            // Add delay between date ranges
            if (i < dateRanges.length - 1) {
                console.log('⏳ Waiting before next date range...');
                await delay(5000); // 5 second delay between date ranges
            }
            
        } catch (error) {
            console.error(`❌ Error processing date range ${i + 1}:`, error.message);
            continue; // Continue with next date range
        }
    }
    
    console.log('\n🎉 COMPREHENSIVE SCRAPING COMPLETED!');
    console.log(`📊 Total records collected: ${allCollectedData.length}`);
    console.log(`💾 Total records saved to MongoDB: ${totalSavedRecords}`);
    console.log(`📅 Processed ${dateRanges.length} date ranges`);
    
    return {
        totalRecords: allCollectedData.length,
        savedRecords: totalSavedRecords,
        dateRangesProcessed: dateRanges.length
    };
}

async function scrapeFirst100Pages() {
    const allData = [];
    let currentViewState = null;
    let successfulPages = 0;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;
    const delayBetweenRequests = 2000;

    console.log('🚀 Starting to scrape first 100 pages...\n');

    try {
        // Step 1: Get initial page (page 1)
        console.log('📄 Fetching page 1 (initial search)...');
        const sessionCookie = await getFreshSession();
        const initialResponse = await getInitialPage(sessionCookie);
        
        // Handle HTML response
        if (initialResponse.isHtmlResponse) {
            console.log('Received HTML response, attempting to parse for data...');
            const page1Data = parseMissingPersons(initialResponse.html);
            
            if (page1Data.length === 0) {
                console.log('No data found in HTML response. This might be the search form page.');
                // Try to parse the HTML to see if it's the search form
                const $ = cheerio.load(initialResponse.html);
                const hasSearchForm = $('form').length > 0;
                console.log('Has search form:', hasSearchForm);
                
                if (hasSearchForm) {
                    console.log('This appears to be the search form page. Submitting search...');
                    
                    // Submit the search form
                    const searchResponse = await submitSearchForm(initialResponse.viewStateData, sessionCookie);
                    
                    if (searchResponse.isHtmlResponse) {
                        console.log('Received search results HTML, parsing for data...');
                        const searchData = parseMissingPersons(searchResponse.html);
                        
                        if (searchData.length === 0) {
                            console.log('No data found in search results. This might mean no records match the search criteria.');
                            // Let's check if there's a "no records" message
                            const $ = cheerio.load(searchResponse.html);
                            const noRecordsMessage = $('.margintopgrid').text().trim();
                            console.log('Search results area content:', noRecordsMessage);
                            
                            if (noRecordsMessage.includes('No records') || noRecordsMessage.includes('total records found: 0')) {
                                console.log('Confirmed: No records found for the search criteria.');
                                return [];
                            } else {
                                throw new Error('Unexpected search results - no data found but no clear "no records" message');
                            }
                        }
                        
                        allData.push(...searchData);
                        console.log(`✅ Search results: Found ${searchData.length} records`);
                        successfulPages++;
                        
                        // Update ViewState for next requests
                        currentViewState = {
                            viewState: searchResponse.viewStateData.viewState,
                            eventValidation: searchResponse.viewStateData.eventValidation,
                            previousPage: searchResponse.viewStateData.previousPage,
                            viewStateGenerator: searchResponse.viewStateData.viewStateGenerator
                        };
                        
                        console.log('Search results:', searchData);
                        return allData;
                    } else {
                        // Handle AJAX search response
                        const searchParsed = parseAjaxResponse(searchResponse);
                        if (searchParsed.html) {
                            const searchData = parseMissingPersons(searchParsed.html);
                            if (searchData.length > 0) {
                                allData.push(...searchData);
                                console.log(`✅ Search results: Found ${searchData.length} records`);
                                successfulPages++;
                                console.log('Search results:', searchData);
                                return allData;
                            }
                        }
                        throw new Error('No data found in search results');
                    }
                } else {
                    throw new Error('Unexpected HTML response - no data and no search form found');
                }
            }
            
            allData.push(...page1Data);
            console.log(`✅ Page 1: Found ${page1Data.length} records from HTML response`);
            successfulPages++;
            
            // Update ViewState for next requests
            currentViewState = {
                viewState: initialResponse.viewStateData.viewState,
                eventValidation: initialResponse.viewStateData.eventValidation,
                previousPage: initialResponse.viewStateData.previousPage,
                viewStateGenerator: initialResponse.viewStateData.viewStateGenerator
            };
            
            console.log(page1Data);
            return allData;
        }
        
        // Handle AJAX response
        const initialParsed = parseAjaxResponse(initialResponse);

        if (initialParsed.isHtmlPage) {
            throw new Error('Received HTML page instead of AJAX response. This usually means the session has expired or the request format is incorrect.');
        }

        if (!initialParsed.html) {
            throw new Error('Could not parse initial response - no HTML content found');
        }

        const page1Data = parseMissingPersons(initialParsed.html);
        if (page1Data.length === 0) {
            throw new Error('No data found on page 1 - check your search parameters');
        }

        allData.push(...page1Data);
        console.log(`✅ Page 1: Found ${page1Data.length} records`);
        successfulPages++;

        // Update ViewState for next requests
        currentViewState = {
            viewState: initialParsed.viewState,
            eventValidation: initialParsed.eventValidation,
            previousPage: initialParsed.previousPage,
            viewStateGenerator: 'B97C20CD'
        };

    //     // Step 2: Scrape pages 2-200
    //     for (let pageNum = 2; pageNum <= 200; pageNum++) {
    //         try {
    //             console.log(`📄 Fetching page ${pageNum}...`);

    //             // Add delay to be respectful to the server
    //             await delay(delayBetweenRequests);

    //             const pageResponse = await getPageWithAjax(pageNum, currentViewState);
    //             const pageParsed = parseAjaxResponse(pageResponse);

    //             if (!pageParsed.html) {
    //                 console.log(`⚠️  Page ${pageNum}: Could not parse response - might be end of data`);
    //                 break;
    //             }

    //             const pageData = parseMissingPersons(pageParsed.html);

    //             if (pageData.length === 0) {
    //                 console.log(`⚠️  Page ${pageNum}: No data found - reached end of results`);
    //                 break;
    //             }

    //             pageData.forEach(entry => {
    //                 const [day, month, year] = entry.dateOfRegistration.split('/');
    //                 entry.dateOfRegistration = new Date(`${year}-${month}-${day}`);
    //             });


    //             const res = await MissingPeople.insertMany(pageData, { ordered: false });
    //             if (res.length === 0) {
    //                 console.log(`⚠️  Page ${pageNum}: No new records to save`);
    //             }

    //             console.log(`✅ Page ${pageNum}: Found ${pageData.length} records (Total: ${allData.length})`);
    //             successfulPages++;
    //             consecutiveErrors = 0;

    //             // Update ViewState for next request
    //             if (pageParsed.viewState) {
    //                 currentViewState.viewState = pageParsed.viewState;
    //             }
    //             if (pageParsed.eventValidation) {
    //                 currentViewState.eventValidation = pageParsed.eventValidation;
    //             }
    //             if (pageParsed.previousPage) {
    //                 currentViewState.previousPage = pageParsed.previousPage;
    //             }


    //         } catch (error) {
    //             consecutiveErrors++;
    //             console.error(`❌ Error on page ${pageNum}:`, error.message);

    //             if (consecutiveErrors >= maxConsecutiveErrors) {
    //                 console.log(`💥 Stopping after ${maxConsecutiveErrors} consecutive errors`);
    //                 break;
    //             }

    //             console.log(`⏳ Waiting longer before retry... (${consecutiveErrors}/${maxConsecutiveErrors})`);
    //             await delay(delayBetweenRequests * 2); // Wait longer after error
    //         }
    //     }
    console.log(page1Data)

    } catch (error) {
        console.error('💥 Fatal error in scraping process:', error.message);
    }
    
   

    // console.log('\n📊 SCRAPING COMPLETED!');
    // console.log(`✅ Successfully scraped ${successfulPages} pages`);
    // console.log(`📝 Total records collected: ${allData.length}`);

    return allData;
}

// getInitialPage().then((response) => console.log(response.data))
//                 .catch((e) => console.log(e.msg))

// Function to scrape all pages and save to MongoDB
async function scrapeAllPagesWithPagination() {
    try {
        console.log('🚀 Starting comprehensive pagination scraping...');
        
        // Get fresh session
        const sessionCookie = await getFreshSession();
        
        // Get initial page and search
        const initialResponse = await getInitialPage(sessionCookie);
        let allData = [];
        let currentViewState = null;
        
        if (initialResponse.isHtmlResponse) {
            console.log('Submitting search...');
            const searchResponse = await submitSearchForm(initialResponse.viewStateData, sessionCookie);
            
            if (searchResponse.isHtmlResponse) {
                const searchData = parseMissingPersons(searchResponse.html);
                console.log(`Found ${searchData.length} records on first page`);
                
                if (searchData.length > 0) {
                    // Add metadata
                    searchData.forEach(record => {
                        record.scrapedAt = new Date();
                        record.searchDateRange = { from: '1/04/2025', to: '25/05/2025' };
                    });
                    
                    allData.push(...searchData);
                    
                    // Update ViewState for pagination
                    currentViewState = {
                        viewState: searchResponse.viewStateData.viewState,
                        eventValidation: searchResponse.viewStateData.eventValidation,
                        previousPage: searchResponse.viewStateData.previousPage,
                        viewStateGenerator: searchResponse.viewStateData.viewStateGenerator
                    };
                }
            } else {
                // Handle AJAX response
                console.log('Parsing AJAX search response...');
                const searchParsed = parseAjaxResponse(searchResponse);
                
                if (searchParsed.html) {
                    const searchData = parseMissingPersons(searchParsed.html);
                    console.log(`Found ${searchData.length} records on first page`);
                    
                    if (searchData.length > 0) {
                        // Add metadata
                        searchData.forEach(record => {
                            record.scrapedAt = new Date();
                            record.searchDateRange = { from: '1/04/2025', to: '25/05/2025' };
                        });
                        
                        allData.push(...searchData);
                        
                        // Update ViewState for pagination
                        currentViewState = {
                            viewState: searchParsed.viewState,
                            eventValidation: searchParsed.eventValidation,
                            previousPage: searchParsed.previousPage,
                            viewStateGenerator: 'B97C20CD'
                        };
                    }
                }
            }
        }
        
        // Now paginate through remaining pages
        if (currentViewState && currentViewState.viewState) {
            console.log('🔄 Starting pagination...');
            
            for (let pageNum = 2; pageNum <= 25; pageNum++) { // Collect up to 25 pages (1300+ records)
                try {
                    console.log(`📄 Fetching page ${pageNum}...`);
                    
                    // Add delay between requests
                    await delay(2000);
                    
                    const pageResponse = await getPageWithAjax(pageNum, currentViewState, sessionCookie);
                    const pageParsed = parseAjaxResponse(pageResponse);
                    
                    if (!pageParsed.html) {
                        console.log(`⚠️  Page ${pageNum}: No HTML content - reached end of results`);
                        break;
                    }
                    
                    const pageData = parseMissingPersons(pageParsed.html);
                    
                    if (pageData.length === 0) {
                        console.log(`⚠️  Page ${pageNum}: No data found - reached end of results`);
                        break;
                    }
                    
                    // Add metadata
                    pageData.forEach(record => {
                        record.scrapedAt = new Date();
                        record.searchDateRange = { from: '1/04/2025', to: '25/05/2025' };
                    });
                    
                    allData.push(...pageData);
                    console.log(`✅ Page ${pageNum}: Found ${pageData.length} records (Total: ${allData.length})`);
                    
                    // Update ViewState for next page
                    if (pageParsed.viewState) {
                        currentViewState.viewState = pageParsed.viewState;
                    }
                    if (pageParsed.eventValidation) {
                        currentViewState.eventValidation = pageParsed.eventValidation;
                    }
                    if (pageParsed.previousPage) {
                        currentViewState.previousPage = pageParsed.previousPage;
                    }
                    
                } catch (error) {
                    console.error(`❌ Error on page ${pageNum}:`, error.message);
                    break; // Stop on error
                }
            }
        }
        
        // Save all data to MongoDB
        if (allData.length > 0) {
            console.log(`💾 Saving ${allData.length} total records to MongoDB...`);
            const savedRecords = await MissingPerson.insertMany(allData, { ordered: false });
            console.log(`✅ Successfully saved ${savedRecords.length} records to MongoDB`);
            
            return savedRecords;
        }
        
        return [];
        
    } catch (error) {
        console.error('Error in pagination scraping:', error.message);
        return [];
    }
}

// Simple function to test pagination and save to MongoDB
async function testSimpleScraping() {
    try {
        console.log('🚀 Starting simple scraping test...');
        
        // Get fresh session
        const sessionCookie = await getFreshSession();
        
        // Get initial page
        const initialResponse = await getInitialPage(sessionCookie);
        
        if (initialResponse.isHtmlResponse) {
            console.log('Submitting search...');
            const searchResponse = await submitSearchForm(initialResponse.viewStateData, sessionCookie);
            
            if (searchResponse.isHtmlResponse) {
                const searchData = parseMissingPersons(searchResponse.html);
                console.log(`Found ${searchData.length} records on first page`);
                
                if (searchData.length > 0) {
                    // Add metadata
                    searchData.forEach(record => {
                        record.scrapedAt = new Date();
                        record.searchDateRange = { from: '1/04/2025', to: '25/05/2025' };
                    });
                    
                    // Save to MongoDB
                    console.log('Saving to MongoDB...');
                    const savedRecords = await MissingPerson.insertMany(searchData, { ordered: false });
                    console.log(`✅ Saved ${savedRecords.length} records to MongoDB`);
                    
                    return savedRecords;
                }
            } else {
                // Handle AJAX response
                console.log('Parsing AJAX search response...');
                const searchParsed = parseAjaxResponse(searchResponse);
                
                if (searchParsed.html) {
                    const searchData = parseMissingPersons(searchParsed.html);
                    console.log(`Found ${searchData.length} records on first page`);
                    
                    if (searchData.length > 0) {
                        // Add metadata
                        searchData.forEach(record => {
                            record.scrapedAt = new Date();
                            record.searchDateRange = { from: '1/04/2025', to: '25/05/2025' };
                        });
                        
                        // Save to MongoDB
                        console.log('Saving to MongoDB...');
                        const savedRecords = await MissingPerson.insertMany(searchData, { ordered: false });
                        console.log(`✅ Saved ${savedRecords.length} records to MongoDB`);
                        
                        return savedRecords;
                    }
                }
            }
        }
        
        return [];
        
    } catch (error) {
        console.error('Error in simple scraping:', error.message);
        return [];
    }
}

// Run missing persons scraping
scrapeAllPagesWithPagination().then((data) => {
    console.log(`\n🎉 Final Results for Missing Persons:`);
    console.log(`📊 Total missing persons collected: ${data.length}`);
    console.log(`💾 All missing persons saved to MongoDB`);
    mongoose.connection.close();
});
// Export functions
export { 
    scrapeFirst100Pages, 
    scrapeAllMissingPersonsData,
    scrapeAllPagesForDateRange,
    scrapeAllPagesWithPagination,
    MissingPerson
};
