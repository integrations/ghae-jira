$('.ghae-register-link').click((event) => {
  event.preventDefault();
  let ghaeUrl = document.getElementById('ghae_url_id').value;

  $.ajax({
    type: 'POST',
    url: `/register?ghaeHost=${encodeURIComponent(ghaeUrl)}`,
    success(data) {
      let ghaeInstance = `https://${data.githubHost}/settings/apps/new?state=${data.state}`;
      document.getElementById('ghae_form_id').action = ghaeInstance;
      document.getElementById('manifest').value = data.manifest;
      document.getElementById('ghae_form_id').submit();
    },
    error(error) {
      document.getElementById("errormessage").innerHTML = error.responseJSON.err;
      console.log(error)
    }
  });
});
