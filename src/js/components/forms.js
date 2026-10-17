export function initForms() {
  document.querySelectorAll('.demo-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const status = form.querySelector('.form-status');
      status.textContent = form.classList.contains('newsletter-form')
        ? 'Preview complete. No subscription was sent. Connect your email platform to enable this form.'
        : form.classList.contains('comment-form')
          ? 'Comment preview complete. Nothing was posted or saved.'
          : 'Your enquiry preview is complete. Nothing was sent or saved. Connect a form backend to enable delivery.';
    });
  });
}
