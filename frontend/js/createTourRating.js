document.getElementById('ratingForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const tourId = document.getElementById('tourId').value;
      const rating = document.getElementById('rating').value;
      const comment = document.getElementById('comment').value;

      const payload = {
        idTour: parseInt(tourId),
        rating: parseInt(rating),
        comment,
        dateOfAttendance: "2025-01-01",  // Hardcoded for now
        dateOfRating: new Date().toISOString() // System time
      };

      console.log("Submitting rating payload:", payload);

      try {
        const response = await fetch(`${API_BASE_URL}/tour-reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Failed to submit rating");

        alert("Ocena uspešno poslata!");
        location.href = "home.html";

      } catch (error) {
        console.error("Submission error:", error);
        alert("Došlo je do greške pri slanju ocene");
      }
    });