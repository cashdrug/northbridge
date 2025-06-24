$(document).ready(function() {
  const validRoles = ['Investor', 'investor', 'Entrepreneur', 'entrepreneur', 'Startup', 'startup'];
  
  $('#join-mail-list-btn, #sign-in-btn').click(function () {
    $('html, body').animate({
      scrollTop: $('#email-list').offset().top
    }, 800);
   
    if ($(this).is('#sign-in-btn')) {
      setTimeout(function () {
        $('#name').focus();
      }, 850);
    }
  });

  async function getIPData() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        ip: data.ip || null,
        country: data.country_name || null,
        city: data.city || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        userAgent: navigator.userAgent
      };
    } catch (error) {
      console.log('IP detection failed:', error);
      return {
        ip: null,
        country: null,
        city: null,
        latitude: null,
        longitude: null,
        userAgent: navigator.userAgent
      };
    }
  }
 
  $('#mail-list-form').off('submit').on('submit', async function (e) {
    e.preventDefault();
    e.stopPropagation();
   
    const form = $(this);
    const submitButton = form.find('button[type="submit"]');
    const buttonSpan = submitButton.find('span');
    const originalButtonText = buttonSpan.text();
   
    const name = $('#name').val().trim();
    const email = $('#email').val().trim();
    const role = $('#role').val().trim();

    if (!name || !email || !role) {
      alert('Please fill in all fields: Name, Email, and Role.');
      return;
    }
   
    if (!/^[\p{L}\s-]+$/u.test(name)) {
      alert('Name can only contain letters, spaces, and hyphens.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
   
    if (!validRoles.includes(role)) {
      alert('Please enter a valid role: Investor, Entrepreneur, or Startup. First letter must be Uppercase');
      return;
    }
   
    submitButton.prop('disabled', true);
    buttonSpan.text('Loading location data...');

    const ipData = await getIPData();
    console.log('IP data loaded:', ipData);
    
    buttonSpan.text('Processing...');
   
    try {
      console.log('Sending data:', { name, role, email, ipData }); 
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, role, email, ipData })
      });
     
      const result = await response.json();
     
      if (!response.ok) {
        const errorMsg = result.errors?.join('\n') || result.message || 'Registration failed';
        throw new Error(errorMsg);
      }
     
      if (result.success) {
        alert(`Thank you ${name}! ${result.message}`);
        form[0].reset();
      } else {
        throw new Error(result.message || 'Registration failed');
      }
     
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      submitButton.prop('disabled', false);
      buttonSpan.text(originalButtonText);
    }
  });
});