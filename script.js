document.addEventListener('DOMContentLoaded', () => {
    // Definir ano atual no rodapé
    document.getElementById('year').textContent = new Date().getFullYear();

    // Menu Mobile Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isActive = navLinks.classList.contains('active');
            mobileMenuBtn.setAttribute('aria-expanded', isActive);
            // Mudar ícone do botão (bars para times)
            const icon = mobileMenuBtn.querySelector('i');
            if (isActive) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                mobileMenuBtn.setAttribute('aria-label', 'Fechar menu de navegação');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                mobileMenuBtn.setAttribute('aria-label', 'Abrir menu de navegação');
            }
        });
    }

    // Fechar menu mobile ao clicar em um link
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.setAttribute('aria-label', 'Abrir menu de navegação');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Mudar estilo do Header ao rolar a página
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
            header.style.padding = '10px 0';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            header.style.padding = '15px 0';
        }
    });

    // Animação suave de scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Compensar o header fixo
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Interceptar envio de formulário para redirecionar ao WhatsApp
    const formContato = document.getElementById('formContato');
    if (formContato) {
        formContato.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nome = document.getElementById('form-nome').value;
            const telefone = document.getElementById('form-telefone').value;
            const servico = document.getElementById('form-servico').value;
            const descricao = document.getElementById('form-descricao').value;

            const mensagem = `Olá! Meu nome é *${nome}*.\n\n*Serviço desejado:* ${servico}\n*Telefone:* ${telefone}\n*Descrição:* ${descricao}\n\nGostaria de solicitar um orçamento.`;
            const numeroWhatsApp = '5581997735936';
            const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
            
            window.open(url, '_blank');
            formContato.reset();
        });
    }
    // Lightbox para Galeria
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentIndex = 0;

    if (lightbox && galleryItems.length > 0) {

        function showImage(index) {
            if (index >= galleryItems.length) {
                index = 0; // Volta para a primeira
            }
            if (index < 0) {
                index = galleryItems.length - 1; // Vai para a última
            }
            currentIndex = index;

            const item = galleryItems[index];
            const img = item.querySelector('img');
            const captionSpan = item.querySelector('.overlay span');

            lightbox.style.display = 'block';
            lightboxImg.src = img.src;
            lightboxCaption.textContent = captionSpan ? captionSpan.textContent : '';
            
            // Impede rolagem do body
            document.body.style.overflow = 'hidden';
        }

        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                showImage(index);
            });
        });

        // Fechar lightbox
        const closeLightbox = () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique feche o lightbox
                showImage(currentIndex - 1);
            });
        }
        if (lightboxNext) {
            lightboxNext.addEventListener('click', (e) => {
                e.stopPropagation();
                showImage(currentIndex + 1);
            });
        }

        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === 'block') {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') showImage(currentIndex + 1);
                if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
            }
        });
    }
});
