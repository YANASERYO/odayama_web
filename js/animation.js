document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       キャッチコピー表示
    ========================= */

    const catchTargets = document.querySelectorAll(".catchcopy");

    if (catchTargets.length > 0) {

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-show");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        catchTargets.forEach(target => observer.observe(target));
    }



    /* =========================
       Instagram QR表示
    ========================= */

    const qr = document.querySelector(".insta_qr");
const newsSection = document.querySelector("#news");
const mediaQuery = window.matchMedia("(max-width: 768px)");

if (qr && newsSection) {
    let observer;

    const setupObserver = () => {
        if (mediaQuery.matches) {
            qr.classList.remove("show");
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            return;
        }

        if (!observer) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        qr.classList.add("show");
                    } else {
                        qr.classList.remove("show");
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(newsSection);
        }
    };

    setupObserver();
    mediaQuery.addEventListener("change", setupObserver);
}



    /* =========================
       フェードアップ
    ========================= */

    const fadeTargets = document.querySelectorAll(".fade-up");

    if (fadeTargets.length > 0) {

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-show");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        fadeTargets.forEach(target => observer.observe(target));
    }

});