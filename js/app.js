
document.addEventListener("DOMContentLoaded", function () {

    const forms = document.querySelectorAll(".js-form");

    forms.forEach(form => {
        const nameInput = form.querySelector("#name");
        const phoneInput = form.querySelector("#phone");

        const nameError = form.querySelector("#nameError");
        const phoneError = form.querySelector("#phoneError");

        const submitBtn = form.querySelector("#submitBtn");

        const formatter = window.phoneFormatter;

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();

            let hasError = false;

            if (!name) {
                nameError.style.display = "block";
                hasError = true;
            } else {
                nameError.style.display = "none";
            }

            if (!formatter || !formatter.validate(phone)) {
                phoneError.style.display = "block";
                hasError = true;
            } else {
                phoneError.style.display = "none";
            }

            if (hasError) return;

            submitBtn.textContent = "Yuborilmoqda...";
            submitBtn.disabled = true;

            const data = {
                name: name,
                phone: formatter.getFullNumber
                    ? formatter.getFullNumber()
                    : phone,
                date: new Date().toLocaleString()
            };

            localStorage.setItem("formData", JSON.stringify(data));

            window.location.href = "./thankYou.html";
        });
    });

}); const swiper = new Swiper(".reviewsSwiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    centeredSlides: false,
    loop: true,

    navigation: {
        nextEl: ".next",
        prevEl: ".prev",
    },

    autoplay: {
        delay: 1800,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },

    breakpoints: {
        480: {
            slidesPerView: 1.2,
            spaceBetween: 15,
        },
        768: {
            slidesPerView: 2.2,
            spaceBetween: 24,
        },
        1024: {
            slidesPerView: 3,
            spaceBetween: 30,
        },
        1280: {
            slidesPerView: 3.6,
        }
    }
});
document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq__item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq__item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
    });
});