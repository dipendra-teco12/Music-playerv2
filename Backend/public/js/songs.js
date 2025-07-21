function formatLength(seconds) {
  if (!seconds || isNaN(seconds)) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function fetchAllMusics(searchQuery = "") {
  axios
    .get("/admin/songs", {
      params: { title: searchQuery },
    })
    .then((response) => {
      const musicData = response.data;
      const $tbody = $("#music-table-body");
      $tbody.empty();

      musicData.forEach((music) => {
        const releaseDate = music.releaseDate
          ? music.releaseDate.split("T")[0]
          : "N/A";

        const row = `
        <tr>
          <td>${music.title}</td>
          <td>${releaseDate}</td>
          <td><span class="tag tag-success">${music.views ?? 0}</span></td>
          <td>${music.singer ?? "Unknown"}</td>
          <td>${formatLength(music.length)}</td>
          <td>
            <button type="button" class="btn btn-danger delete-btn" data-id="${
              music._id
            }">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
          </td>
        </tr>
      `;
        $tbody.append(row);
      });
    })
    .catch((error) => {
      console.error("❌ Failed to fetch musics:", error);
    });
}

function deleteMusic(id) {
  if (!confirm("Are you sure you want to delete this song?")) return;

  axios
    .delete(`/admin/song/${id}`)
    .then(() => {
      fetchAllMusics();
      fetchCounts();
    })
    .catch((error) => {
      console.error("❌ Delete failed:", error);
      alert("Delete failed. See console for details.");
    });
}

$(document).on("click", ".delete-btn", function () {
  const id = $(this).data("id");
  deleteMusic(id);
});

$(document).ready(() => {
  fetchAllMusics(); // Load initially

  $("#searchBtn").on("click", () => {
    const searchTerm = $("#searchInput").val().trim();
    fetchAllMusics(searchTerm);
  });

  $("#searchInput").on("keypress", function (e) {
    if (e.which === 13) {
      $("#searchBtn").click();
    }
  });
});
