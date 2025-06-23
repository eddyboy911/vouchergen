
document.addEventListener('DOMContentLoaded', () => {
  const itineraryBody = document.querySelector('#itineraryTable tbody');
  const addRowBtn = document.getElementById('addRowBtn');

  function addRow(data = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = \`
      <td><input type="date" value="\${data.checkIn || ''}" class="checkin"></td>
      <td><input type="date" value="\${data.checkOut || ''}" class="checkout"></td>
      <td><input type="text"  value="\${data.city || ''}" class="city"></td>
      <td><input type="text"  value="\${data.hotel || ''}" class="hotel"></td>
      <td><input type="text"  value="\${data.status || ''}" class="status"></td>
      <td><button type="button" class="removeBtn">X</button></td>
    \`;
    itineraryBody.appendChild(tr);
  }

  addRowBtn.addEventListener('click', () => addRow());

  itineraryBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('removeBtn')) {
      e.target.closest('tr').remove();
    }
  });

  document.getElementById('voucherForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const itinerary = Array.from(itineraryBody.querySelectorAll('tr')).map(tr => ({
      checkIn: tr.querySelector('.checkin').value,
      checkOut: tr.querySelector('.checkout').value,
      city: tr.querySelector('.city').value,
      hotel: tr.querySelector('.hotel').value,
      status: tr.querySelector('.status').value
    }));

    const formData = {
      name: document.getElementById('name').value,
      pax: document.getElementById('pax').value,
      bookingDate: document.getElementById('bookingDate').value,
      mealPlan: document.getElementById('mealPlan').value,
      rooms: document.getElementById('rooms').value,
      nights: document.getElementById('nights').value,
      gst: document.getElementById('gst').value,
      phone: document.getElementById('phone').value,
      itinerary
    };

    const response = await fetch('/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      alert('Error generating PDF');
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voucher_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  });
});
