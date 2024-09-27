const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://atharvayadav11:ashokvaishali@cluster0.twnwnbu.mongodb.net/NFCDatabase?retryWrites=true&w=majority')
.then(() => console.log('MongoDB connected!'))
.catch((err) => console.log(err));
