export function shraniSejo(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("vloga", data.vloga);
  window.dispatchEvent(new Event("glass-seja"));
}

export function odjavi() {
  localStorage.removeItem("token");
  localStorage.removeItem("vloga");
  window.location.hash = "";
  window.dispatchEvent(new Event("glass-seja"));
}
