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

// Define Arrested Person Schema
const arrestedPersonSchema = new mongoose.Schema({
  srNo: { type: Number, required: true },
  imageUrl: { type: String, default: null },
  dateOfArrest: { type: String, required: true },
  nameOfArrestedPerson: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  district: { type: String, required: true },
  policeStation: { type: String, required: true },
  nationality: { type: String, default: null },
  personType: { type: String, required: true }, // Arrested or Surrendered
  caseDetails: { type: String, default: null },
  contactInfo: { type: String, default: null },
  scrapedAt: { type: Date, default: Date.now },
  searchDateRange: {
    from: String,
    to: String
  }
}, { collection: 'arrestedPersons' });

// Create model
const ArrestedPerson = mongoose.model('ArrestedPerson', arrestedPersonSchema);

// Utility functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDateForPortal(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function parseAjaxResponse(responseText) {
    try {
        // Handle both HTML and AJAX responses
        if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
            console.log('Received HTML response, parsing for ViewState...');
            return parseHtmlForViewState(responseText);
        }
        
        // Handle AJAX response
        const lines = responseText.split('\n');
        let viewState = '';
        let eventValidation = '';
        let previousPage = '';
        let html = '';

        for (const line of lines) {
            if (line.includes('__VIEWSTATE|')) {
                viewState = line.split('|')[1];
            } else if (line.includes('__EVENTVALIDATION|')) {
                eventValidation = line.split('|')[1];
            } else if (line.includes('__PREVIOUSPAGE|')) {
                previousPage = line.split('|')[1];
            } else if (line.includes('<table') || line.includes('<tr') || line.includes('<td')) {
                html += line + '\n';
            }
        }

        return {
            viewState,
            eventValidation,
            previousPage,
            html
        };
    } catch (error) {
        console.error('Error parsing AJAX response:', error.message);
        return { viewState: '', eventValidation: '', previousPage: '', html: '' };
    }
}

function parseHtmlForViewState(html) {
    const $ = cheerio.load(html);
    
    const viewState = $('input[name="__VIEWSTATE"]').attr('value') || '';
    const viewStateGenerator = $('input[name="__VIEWSTATEGENERATOR"]').attr('value') || '';
    const eventValidation = $('input[name="__EVENTVALIDATION"]').attr('value') || '';
    const previousPage = $('input[name="__PREVIOUSPAGE"]').attr('value') || '';
    const viewStateEncrypted = $('input[name="__VIEWSTATEENCRYPTED"]').attr('value') || '';
    
    return {
        viewState,
        viewStateGenerator,
        eventValidation,
        previousPage,
        viewStateEncrypted
    };
}

// Function to get fresh session for arrested persons
async function getFreshSessionArrested() {
    try {
        const response = await axios.get('https://citizen.mahapolice.gov.in/Citizen/MH/SearcgAccusedArrest.aspx', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 60000
        });
        
        const cookies = response.headers['set-cookie'];
        if (cookies) {
            return cookies.map(cookie => cookie.split(';')[0]).join('; ');
        }
        return '';
    } catch (error) {
        console.error('Error getting fresh session for arrested persons:', error.message);
        return '';
    }
}

// Function to get initial arrested persons page
async function getInitialArrestedPage(sessionCookie = null) {
    // If no session cookie provided, get a fresh one
    if (!sessionCookie) {
        sessionCookie = await getFreshSessionArrested();
    }
    
    // Set default date values (Note: Data available from 26/06/2015)
    const fromDate = '01/01/2024';
    const toDate = '25/09/2025';
    
    const data = qs.stringify({
        'ctl00$ScriptManager1': 'ctl00$ContentPlaceHolder1$UpdatePanel2|ctl00$ContentPlaceHolder1$btnSearch',
        '__EVENTTARGET': '',
        '__EVENTARGUMENT': '',
        '__LASTFOCUS': '',
        '__VIEWSTATE': '', // Will be populated from HTML response
        '__VIEWSTATEGENERATOR': '',
        '__VIEWSTATEENCRYPTED': '',
        '__PREVIOUSPAGE': '',
        '__EVENTVALIDATION': '',
        'ctl00$ContentPlaceHolder1$txtDateRangeFrom': fromDate,
        'ctl00$ContentPlaceHolder1$meeDateRangeFrom_ClientState': '',
        'ctl00$ContentPlaceHolder1$txtDateRangeTo': toDate,
        'ctl00$ContentPlaceHolder1$meeDateRangeTo_ClientState': '',
        'ctl00$ContentPlaceHolder1$txtFirstName': '',
        'ctl00$ContentPlaceHolder1$txtMiddleName': '',
        'ctl00$ContentPlaceHolder1$txtLastName': '',
        'ctl00$ContentPlaceHolder1$txtAgefrom': '',
        'ctl00$ContentPlaceHolder1$txtAgeTo': '',
        'ctl00$ContentPlaceHolder1$ddlDistrict': 'Select',
        'ctl00$ContentPlaceHolder1$ddlGender': 'Select',
        'ctl00$ContentPlaceHolder1$ddlPS': 'Select',
        'ctl00$ContentPlaceHolder1$ddlnationality': '80', // India
        'ctl00$ContentPlaceHolder1$ddlSearchCriteria': 'Relaxed',
        'ctl00$ContentPlaceHolder1$ddlPerType': 'Arrested',
        'ctl00$ContentPlaceHolder1$btnHidden': '',
        'ctl00$hdnSessionIdleTime': '',
        'ctl00$hdnUserUniqueId': ''
    });

    const config = {
        method: 'post',
        url: 'https://citizen.mahapolice.gov.in/Citizen/MH/SearcgAccusedArrest.aspx',
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': sessionCookie,
            'Origin': 'https://citizen.mahapolice.gov.in',
            'Pragma': 'no-cache',
            'Referer': 'https://citizen.mahapolice.gov.in/Citizen/MH/SearcgAccusedArrest.aspx',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'X-MicrosoftAjax': 'Delta=true',
            'X-Requested-With': 'XMLHttpRequest'
        },
        data: data,
        timeout: 60000
    };

    const response = await axios.request(config);
    console.log('Arrested persons response status:', response.status);
    console.log('Arrested persons response data length:', response.data.length);
    
    // If we get HTML response, parse it for ViewState and return the HTML
    if (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html')) {
        console.log('Received HTML response for arrested persons, parsing for ViewState...');
        const viewStateData = parseHtmlForViewState(response.data);
        
        // Extract actual form values from the HTML
        const $ = cheerio.load(response.data);
        const formValues = {};
        $('input, select').each((i, el) => {
            const name = $(el).attr('name');
            const value = $(el).attr('value') || $(el).val() || '';
            if (name) {
                formValues[name] = value;
            }
        });
        
        console.log('Extracted form values:', Object.keys(formValues));
        console.log('Sample form values:');
        Object.keys(formValues).slice(0, 5).forEach(key => {
            console.log(`  ${key}: ${formValues[key]}`);
        });
        
        return {
            isHtmlResponse: true,
            html: response.data,
            viewStateData: viewStateData,
            sessionCookie: sessionCookie,
            formValues: formValues
        };
    }
    
    return response.data;
}

// Function to submit arrested persons search form
async function submitArrestedSearchForm(viewStateData, sessionCookie, dateRange = null, formValues = null) {
    console.log('Submitting arrested persons search form...');
    
    // Use provided date range or default to recent dates (like the working payload)
    let fromDate = '01/07/2025';
    let toDate = '29/07/2025';
    
    if (dateRange) {
        fromDate = formatDateForPortal(dateRange.from);
        toDate = formatDateForPortal(dateRange.to);
        console.log(`Using date range: ${fromDate} to ${toDate}`);
    } else {
        console.log(`Using default date range: ${fromDate} to ${toDate}`);
    }
    
    // Use form values if provided, otherwise use defaults matching the working payload
    const searchData = {
        'ctl00$ScriptManager1': 'ctl00$ContentPlaceHolder1$UpdatePanel2|ctl00$ContentPlaceHolder1$btnSearch',
        '__EVENTTARGET': '',
        '__EVENTARGUMENT': '',
        '__LASTFOCUS': '',
        '__VIEWSTATE': viewStateData.viewState,
        '__VIEWSTATEGENERATOR': viewStateData.viewStateGenerator,
        '__VIEWSTATEENCRYPTED': '',
        '__PREVIOUSPAGE': viewStateData.previousPage,
        '__EVENTVALIDATION': viewStateData.eventValidation,
        'ctl00$hdnSessionIdleTime': '',
        'ctl00$hdnUserUniqueId': '',
        'ctl00$ContentPlaceHolder1$txtDateRangeFrom': fromDate,
        'ctl00$ContentPlaceHolder1$meeDateRangeFrom_ClientState': '',
        'ctl00$ContentPlaceHolder1$txtFirstName': '',
        'ctl00$ContentPlaceHolder1$txtDateRangeTo': toDate,
        'ctl00$ContentPlaceHolder1$meeDateRangeTo_ClientState': '',
        'ctl00$ContentPlaceHolder1$txtMiddleName': '',
        'ctl00$ContentPlaceHolder1$txtAgefrom': '20',
        'ctl00$ContentPlaceHolder1$txtAgeTo': '60',
        'ctl00$ContentPlaceHolder1$txtLastName': '',
        'ctl00$ContentPlaceHolder1$ddlDistrict': '',
        'ctl00$ContentPlaceHolder1$ddlGender': '',
        'ctl00$ContentPlaceHolder1$ddlnationality': '',
        'ctl00$ContentPlaceHolder1$ddlSearchCriteria': '',
        'ctl00$ContentPlaceHolder1$ddlPerType': '',
        '__ASYNCPOST': 'true',
        'ctl00$ContentPlaceHolder1$btnSearch': 'Search'
    };
    
    // Override with actual form values if available
    if (formValues) {
        // Only override specific fields we need, keeping the structure intact
        if (formValues['ctl00$hdnSessionIdleTime']) {
            searchData['ctl00$hdnSessionIdleTime'] = formValues['ctl00$hdnSessionIdleTime'];
        }
        if (formValues['ctl00$hdnUserUniqueId']) {
            searchData['ctl00$hdnUserUniqueId'] = formValues['ctl00$hdnUserUniqueId'];
        }
        console.log('Using extracted form values for submission');
        
        // Override date fields with our search dates
        searchData['ctl00$ContentPlaceHolder1$txtDateRangeFrom'] = fromDate;
        searchData['ctl00$ContentPlaceHolder1$txtDateRangeTo'] = toDate;
        console.log(`Setting date range: ${fromDate} to ${toDate}`);
    }
    
    const data = qs.stringify(searchData);

    const config = {
        method: 'post',
        url: 'https://citizen.mahapolice.gov.in/Citizen/MH/SearcgAccusedArrest.aspx',
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': sessionCookie,
            'Origin': 'https://citizen.mahapolice.gov.in',
            'Pragma': 'no-cache',
            'Referer': 'https://citizen.mahapolice.gov.in/Citizen/MH/SearcgAccusedArrest.aspx',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'X-MicrosoftAjax': 'Delta=true',
            'X-Requested-With': 'XMLHttpRequest'
        },
        data: data,
        timeout: 60000
    };

    const response = await axios.request(config);
    console.log('Arrested search response status:', response.status);
    console.log('Arrested search response data length:', response.data.length);
    console.log('First 500 chars of arrested search response:', response.data.substring(0, 500));
    
    // If we get HTML response, parse it for ViewState and return the HTML
    if (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html')) {
        console.log('Received HTML response for arrested search, parsing for ViewState...');
        const viewStateData = parseHtmlForViewState(response.data);
        return {
            isHtmlResponse: true,
            html: response.data,
            viewStateData: viewStateData
        };
    }
    
    return response.data;
}

// Function to get arrested persons page with AJAX
async function getArrestedPageWithAjax(pageNumber, viewStateData, sessionCookie) {
    const data = qs.stringify({
        'ctl00$ScriptManager1': 'ctl00$ContentPlaceHolder1$UpdatePanel2|ctl00$ContentPlaceHolder1$gdvArrestRegistrationdetails',
        '__EVENTTARGET': 'ctl00$ContentPlaceHolder1$gdvArrestRegistrationdetails',
        '__EVENTARGUMENT': `Page$${pageNumber}`,
        '__LASTFOCUS': '',
        '__VIEWSTATE': viewStateData.viewState,
        '__VIEWSTATEGENERATOR': viewStateData.viewStateGenerator || 'EFD4CB67',
        '__VIEWSTATEENCRYPTED': '',
        '__PREVIOUSPAGE': viewStateData.previousPage,
        '__EVENTVALIDATION': viewStateData.eventValidation,
        'ctl00$ContentPlaceHolder1$txtDateRangeFrom': '01/01/2024',
        'ctl00$ContentPlaceHolder1$txtDateRangeTo': '25/09/2025',
        'ctl00$ContentPlaceHolder1$txtFirstName': '',
        'ctl00$ContentPlaceHolder1$txtMiddleName': '',
        'ctl00$ContentPlaceHolder1$txtLastName': '',
        'ctl00$ContentPlaceHolder1$txtAgefrom': '',
        'ctl00$ContentPlaceHolder1$txtAgeTo': '',
        'ctl00$ContentPlaceHolder1$ddlDistrict': 'Select',
        'ctl00$ContentPlaceHolder1$ddlGender': 'Select',
        'ctl00$ContentPlaceHolder1$ddlPS': 'Select',
        'ctl00$ContentPlaceHolder1$ddlnationality': '80', // India
        'ctl00$ContentPlaceHolder1$ddlSearchCriteria': 'Relaxed',
        'ctl00$ContentPlaceHolder1$ddlPerType': 'Arrested',
        'ctl00$ContentPlaceHolder1$btnHidden': '',
        'ctl00$hdnSessionIdleTime': '',
        'ctl00$hdnUserUniqueId': ''
    });

    const config = {
        method: 'post',
        url: 'https://citizen.mahapolice.gov.in/Citizen/MH/SearcgAccusedArrest.aspx',
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': sessionCookie,
            'Origin': 'https://citizen.mahapolice.gov.in',
            'Pragma': 'no-cache',
            'Referer': 'https://citizen.mahapolice.gov.in/Citizen/MH/SearcgAccusedArrest.aspx',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'X-MicrosoftAjax': 'Delta=true',
            'X-Requested-With': 'XMLHttpRequest'
        },
        data: data,
        timeout: 60000
    };

    const response = await axios.request(config);
    return response.data;
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

    return arrestedPersons;
}

// Function to scrape all arrested persons pages with pagination
async function scrapeAllArrestedPersonsPages() {
    try {
        console.log('🚀 Starting arrested persons scraping...');
        
        // Get fresh session for arrested persons
        const sessionCookie = await getFreshSessionArrested();
        
        // Get initial page and search
        const initialResponse = await getInitialArrestedPage(sessionCookie);
        let allData = [];
        let currentViewState = null;
        
        if (initialResponse.isHtmlResponse) {
            console.log('Submitting arrested persons search...');
            const searchResponse = await submitArrestedSearchForm(
                initialResponse.viewStateData, 
                sessionCookie, 
                null, 
                initialResponse.formValues
            );
            
            if (searchResponse.isHtmlResponse) {
                const searchData = parseArrestedPersons(searchResponse.html);
                console.log(`Found ${searchData.length} arrested persons on first page`);
                
                if (searchData.length > 0) {
                    // Add metadata
                    searchData.forEach(record => {
                        record.scrapedAt = new Date();
                        record.searchDateRange = { from: '01/01/2024', to: '25/09/2025' };
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
                console.log('Parsing AJAX arrested persons search response...');
                const searchParsed = parseAjaxResponse(searchResponse);
                
                if (searchParsed.html) {
                    const searchData = parseArrestedPersons(searchParsed.html);
                    console.log(`Found ${searchData.length} arrested persons on first page`);
                    
                    if (searchData.length > 0) {
                        // Add metadata
                        searchData.forEach(record => {
                            record.scrapedAt = new Date();
                            record.searchDateRange = { from: '01/01/2024', to: '25/09/2025' };
                        });
                        
                        allData.push(...searchData);
                        
                        // Update ViewState for pagination
                        currentViewState = {
                            viewState: searchParsed.viewState,
                            eventValidation: searchParsed.eventValidation,
                            previousPage: searchParsed.previousPage,
                            viewStateGenerator: 'EFD4CB67'
                        };
                    }
                }
            }
        }
        
        // Now paginate through remaining pages
        if (currentViewState && currentViewState.viewState) {
            console.log('🔄 Starting arrested persons pagination...');
            
            for (let pageNum = 2; pageNum <= 25; pageNum++) { // Collect up to 25 pages
                try {
                    console.log(`📄 Fetching arrested persons page ${pageNum}...`);
                    
                    // Add delay between requests
                    await delay(2000);
                    
                    const pageResponse = await getArrestedPageWithAjax(pageNum, currentViewState, sessionCookie);
                    const pageParsed = parseAjaxResponse(pageResponse);
                    
                    if (!pageParsed.html) {
                        console.log(`⚠️  Page ${pageNum}: No HTML content - reached end of results`);
                        break;
                    }
                    
                    const pageData = parseArrestedPersons(pageParsed.html);
                    
                    if (pageData.length === 0) {
                        console.log(`⚠️  Page ${pageNum}: No data found - reached end of results`);
                        break;
                    }
                    
                    // Add metadata
                    pageData.forEach(record => {
                        record.scrapedAt = new Date();
                        record.searchDateRange = { from: '01/01/2024', to: '25/02/2024' };
                    });
                    
                    allData.push(...pageData);
                    console.log(`✅ Page ${pageNum}: Found ${pageData.length} arrested persons (Total: ${allData.length})`);
                    
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
                    console.error(`❌ Error on arrested persons page ${pageNum}:`, error.message);
                    break; // Stop on error
                }
            }
        }
        
        // Save all data to MongoDB
        if (allData.length > 0) {
            console.log(`💾 Saving ${allData.length} arrested persons to MongoDB...`);
            const savedRecords = await ArrestedPerson.insertMany(allData, { ordered: false });
            console.log(`✅ Successfully saved ${savedRecords.length} arrested persons to MongoDB`);
            
            return savedRecords;
        }
        
        return [];
        
    } catch (error) {
        console.error('Error in arrested persons scraping:', error.message);
        return [];
    }
}

// Export functions
export { 
    scrapeAllArrestedPersonsPages,
    ArrestedPerson
};

// Run arrested persons scraping
scrapeAllArrestedPersonsPages().then((data) => {
    console.log(`\n🎉 Final Results for Arrested Persons:`);
    console.log(`📊 Total arrested persons collected: ${data.length}`);
    console.log(`💾 All arrested persons saved to MongoDB`);
    mongoose.connection.close();
});