document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("taskForm");
    const list = document.getElementById("taskList");
    const notificationAudio = document.getElementById("notificationSound");

    let tasks = JSON.parse(localStorage.getItem("studyTasks") || "[]");

    function formatTime(v) {
        if (!v) return "";
        const [h, m] = v.split(":");
        let hr = parseInt(h);
        const ampm = hr >= 12 ? "PM" : "AM";
        hr = ((hr + 11) % 12) + 1;
        return `${hr}:${m} ${ampm}`;
    }

    function renderTasks() {
        list.innerHTML = "";
        if (tasks.length === 0) {
            list.innerHTML = "<li>No tasks yet — add a study goal!</li>";
            return;
        }

        tasks.forEach((task, i) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong>${task.title}</strong>
                    <div class="timeline">${formatTime(task.time)} • ${task.date}</div>
                </div>
                <span class="remove" data-idx="${i}">&times;</span>
            `;
            list.appendChild(li);
        });

        document.querySelectorAll(".remove").forEach(btn => {
            btn.addEventListener("click", () => {
                tasks.splice(parseInt(btn.dataset.idx), 1);
                localStorage.setItem("studyTasks", JSON.stringify(tasks));
                renderTasks();
            });
        });
    }

    form.addEventListener("submit", e => {
        e.preventDefault();

        const title = document.getElementById("taskTitle").value.trim();
        const time = document.getElementById("taskTime").value;
        const date = document.getElementById("taskDate").value;

        if (!title || !time || !date) return;

        tasks.push({ title, time, date, notified: false });
        localStorage.setItem("studyTasks", JSON.stringify(tasks));
        form.reset();
        renderTasks();
    });

    if ("Notification" in window) {
        Notification.requestPermission();
    }

    setInterval(() => {
        const now = new Date();

        tasks.forEach((task, i) => {
            if (!task.notified) {
                const taskTime = new Date(`${task.date}T${task.time}:00`);

                if (now >= taskTime) {
                    if (notificationAudio) {
                        notificationAudio.currentTime = 0;
                        notificationAudio.play().catch(err => {
                            console.log("Audio blocked by browser:", err);
                        });
                    }

                    if (Notification.permission === "granted") {
                        new Notification("🔔 Study Reminder", {
                            body: `Time for: ${task.title}`
                        });
                    } else {
                        alert(`Reminder: ${task.title}`);
                    }

                    tasks[i].notified = true;
                    localStorage.setItem("studyTasks", JSON.stringify(tasks));
                    renderTasks();
                }
            }
        });
    }, 15000);

    renderTasks();

    // Typed.js animation
    new Typed('#typed', {
        strings: ["Focus on your goals.", "Plan your time wisely.", "Study smart, not hard."],
        typeSpeed: 50,
        backSpeed: 30,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });

    // Optional: particles.js effect
    particlesJS("particles-js", {
        particles: {
            number: { value: 60 },
            size: { value: 3 },
            move: { speed: 1 },
            line_linked: { enable: true, opacity: 0.3 }
        },
        interactivity: { detect_on: "canvas", events: { onhover: { enable: true, mode: "repulse" } } }
    });
});
