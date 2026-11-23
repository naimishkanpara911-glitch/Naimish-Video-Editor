const player = document.getElementById("video-player");
const mount = document.getElementById("video-mount");
const title = document.getElementById("video-title");
const closeButton = document.getElementById("close-video");
const drive = document.getElementById("drive-alternative");
let trigger;

document.addEventListener("click", event => {
  const link = event.target.closest("a[data-video], a[data-featured-video]");
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !player.showModal) return;
  event.preventDefault();
  trigger = link;
  title.textContent = link.dataset.title;
  drive.href = link.href;
  const video = document.createElement("video");
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.poster = link.dataset.poster;
  video.src = link.dataset.file;
  video.setAttribute("aria-label", link.dataset.title);
  mount.replaceChildren(video);
  player.showModal();
  document.documentElement.classList.add("watching-video");
  closeButton.focus({ preventScroll: true });
  video.play().catch(() => {});
});

closeButton.addEventListener("click", () => player.close());
player.addEventListener("click", event => {
  if (event.target !== player) return;
  const box = player.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) player.close();
});
player.addEventListener("close", () => {
  const video = mount.querySelector("video");
  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
  mount.replaceChildren();
  document.documentElement.classList.remove("watching-video");
  trigger?.focus({ preventScroll: true });
});
