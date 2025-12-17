(function(){
  'use strict';
  var loginForm=document.getElementById('loginForm');
  if(loginForm){loginForm.addEventListener('submit',function(e){var btn=document.getElementById('submitBtn'),txt=btn.querySelector('.btn-text'),load=btn.querySelector('.btn-loading');var email=loginForm.querySelector('[name="email"]').value,pass=loginForm.querySelector('[name="password"]').value;if(!email||!pass){e.preventDefault();showError(loginForm,'Please fill in all fields');return;}txt.style.display='none';load.style.display='inline';btn.disabled=true;});}
  var regForm=document.getElementById('registerForm');
  if(regForm){regForm.addEventListener('submit',function(e){var btn=document.getElementById('submitBtn'),txt=btn.querySelector('.btn-text'),load=btn.querySelector('.btn-loading');var pass=regForm.querySelector('[name="password"]').value,conf=regForm.querySelector('[name="confirmPassword"]').value;if(pass!==conf){e.preventDefault();showError(regForm,'Passwords do not match');return;}txt.style.display='none';load.style.display='inline';btn.disabled=true;});}
  function showError(f,m){var a=f.querySelector('.alert-error');if(!a){a=document.createElement('div');a.className='alert alert-error';f.insertBefore(a,f.firstChild);}a.textContent=m;}
})();