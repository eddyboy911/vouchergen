
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// serve form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/generate-pdf', async (req, res) => {
  try {
    const data = req.body;

    // build itinerary array from payload (strings => JSON)
    let itinerary = [];
    if (Array.isArray(data.itinerary)) {
      itinerary = data.itinerary;
    } else if (typeof data.itinerary === 'string') {
      try { itinerary = JSON.parse(data.itinerary); } catch(e){ itinerary=[]; }
    }

    // Path to logo
    const logoPath = path.join(__dirname, 'public', 'images', 'logo.png');
    const logoUrl = 'file://' + logoPath;

    const html = await ejs.renderFile(
      path.join(__dirname, 'views', 'voucherTemplate.ejs'),
      {
        logoPath: logoUrl,
        gst: data.gst || 'XX-XXXXXXXX',
        phone: data.phone || '',
        guestName: data.name,
        bookingDate: data.bookingDate,
        pax: data.pax,
        mealPlan: data.mealPlan,
        rooms: data.rooms,
        nights: data.nights,
        itinerary
      }
    );

    // launch puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const filename = `voucher_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating PDF');
  }
});

app.listen(port, () => {
  console.log(`Voucher Generator running on port ${port}`);
});
