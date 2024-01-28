const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
let deleteBtn = document.querySelectorAll("#deleteBtn");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const a = document.createElement("a");
  a.href = `/`;
  a.className = "comment__avatar";
  const img = document.createElement("img");
  img.src = "/" + "";
  img.width = "30";
  img.height = "30";
  const div1 = document.createElement("div");
  const div2 = document.createElement("div");
  div2.className = "comment__owner";
  const spanName = document.createElement("span");
  spanName.innerText = `ㅇ • `;
  const spanDate = document.createElement("span");
  spanDate.innerText = `방금 전`;
  const spanText = document.createElement("span");
  spanText.innerText = `${text}`;
  const deleteBtn = document.createElement("button");
  deleteBtn.id = "deleteBtn";
  const deleteBtnIcon = document.createElement("i");
  deleteBtnIcon.className = "fas fa-trash-can";
  const hr = document.createElement("hr");
  a.appendChild(img);
  div2.appendChild(spanName);
  div2.appendChild(spanDate);
  div1.appendChild(div2);
  div1.appendChild(spanText);
  deleteBtn.appendChild(deleteBtnIcon);
  newComment.appendChild(a);
  newComment.appendChild(div1);
  newComment.appendChild(deleteBtn);
  videoComments.prepend(hr);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("input");
  const videoId = videoContainer.dataset.id;
  const text = textarea.value;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

const handleDelete = async (event) => {
  const li = event.target.parentElement.parentElement;
  const hr = li.nextSibling;
  const commentId = li.dataset.id;
  await fetch(`/api/videos/${commentId}/comment/delete`, {
    method: "DELETE",
  });
  li.remove();
  hr.remove();
};

if (deleteBtn) {
  deleteBtn.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", handleDelete);
  });
}
