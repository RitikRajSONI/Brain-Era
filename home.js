

// Particle effects on click
function createParticles(x, y) {
    for (let i = 50; i < 100; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '5px';
        particle.style.height = '5px';
        particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';

        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / 10;
        const velocity = 2 + Math.random() * 3;

        let dx = Math.cos(angle) * velocity;
        let dy = Math.sin(angle) * velocity;
        let life = 40;

        function animateParticle() {
            x += dx;
            y += dy;
            dy += 0.1; // gravity
            life--;

            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = life / 60;

            if (life > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                document.body.removeChild(particle);
            }
        }

        animateParticle();
    }
}

//to game
let gamename;
function opengame(gamename) {
    switch (gamename) {
        case "pairbuster":
            window.location.href = "pairbuster.html"; break;
        case "Fragment Forge":
            window.location.href = "FragmentForge.html"; break;
        case "Typing Blitz":
            window.location.href = "TypingBlitz.html"; break
    }
}
