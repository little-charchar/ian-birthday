// Config
const hearts = [
    { video: 'videos/charlene.mov', color: '#ff0000', heading: 'Charlene', profile: '' },
    { video: 'videos/dorian.mov', color: '#ff9ff3', heading: 'Dorian', profile: 'images/dorian_pic.png' },
    { video: 'videos/rick.mov', color: '#ff9ff3', heading: 'Rick', profile: 'images/rick_pic.png' },
    { video: 'videos/alex.mp4', color: '#ff9ff3', heading: 'Alex', profile: 'images/alex_pic.png' },
    { video: 'videos/aurora.mov', color: '#ff9ff3', heading: 'Aurora & Friends', profile: 'images/aurora_pic.png' },
    { video: 'videos/caroline.mov', color: '#ff9ff3', heading: 'Caroline', profile: 'images/caroline_pic.png' },
    { video: 'videos/jasmine.MOV', color: '#ff9ff3', heading: 'Jasmine', profile: 'images/jasmine_pic.png' },
    { video: 'videos/colette.mov', color: '#ff9ff3', heading: 'Colette', profile: 'images/colette_pic.png' },
    { video: 'videos/julia.mov', color: '#ff9ff3', heading: 'Julia', profile: 'images/julia_pic.png' },
    { video: 'videos/emma.MOV', color: '#ff9ff3', heading: 'Emma', profile: 'images/emma_pic.png' },
    { video: 'videos/arya.mov', color: '#ff9ff3', heading: 'Arya', profile: 'images/arya_pic.png' },
    { video: 'videos/char_friends.mov', color: '#ff9ff3', heading: 'Char\'s Friends', profile: 'images/char_friends_pic.png' },
    { video: 'videos/olivia.mov', color: '#ff9ff3', heading: 'Olivia', profile: 'images/olivia_pic.png' },
    { video: 'videos/elijah_and_ishaan.mov', color: '#ff9ff3', heading: 'Elijah & Ishaan', profile: 'images/elijah_and_ishaan_pic.png' },
    { video: 'videos/ori.mov', color: '#ff9ff3', heading: 'Ori', profile: 'images/ori_pic.png' },
    { video: 'videos/advait.mov', color: '#ff9ff3', heading: 'Advait', profile: 'images/advait_pic.png' },
    { video: 'videos/tong.MOV', color: '#ff9ff3', heading: 'Tong', profile: 'images/tong_pic.png' },
    { video: 'videos/vadim.mov', color: '#ff9ff3', heading: 'Vadim', profile: 'images/vadim_pic.png' },
    { video: 'videos/sam.mov', color: '#ff9ff3', heading: 'Sam', profile: 'images/sam_pic.png' },
    { video: 'videos/lara.mov', color: '#ff9ff3', heading: 'Lara', profile: 'images/lara_pic.png'},
    { video: 'videos/edison.mov', color: '#ff9ff3', heading: 'Edison', profile: 'images/edison_pic.png'},
    { video: 'videos/maggie.mov', color: '#ff9ff3', heading: 'Maggie', profile: 'images/maggie_pic.png'},
    { video: 'videos/daniel.mov', color: '#ff9ff3', heading: 'Daniel', profile: 'images/daniel_pic.png'},
    { video: 'videos/yassine.mov', color: '#ff9ff3', heading: 'Yassine', profile: 'images/yassine_pic.png'},
    { video: 'videos/zhiling.mov', color: '#ff9ff3', heading: 'Zhi Ling', profile: 'images/zhiling_pic.png'},
    { video: 'videos/feng.mov', color: '#ff9ff3', heading: 'Feng', profile: 'images/feng_pic.png'}
];

const BOUNCE = 0.3;
const FRICTION = 0.999;
const HEART_SIZE = 50;
const RANDOM_FORCE = 0.1;
const BOUNDARY_PADDING = 40;
const MIN_DISTANCE = HEART_SIZE * 1.2;
const REPULSION_FORCE = 0.5;
const VERTICAL_DRIFT = 0.02;
const HEADING_ZONE_HEIGHT = 80;

const heartPhysics = new Map();
const originalHearts = [...hearts];

const container = document.getElementById('hearts');
if (!container) {
    console.error('Hearts container not found!');
} else {
    container.innerHTML = '';
}
const videoPopup = document.querySelector('.video-popup');
const popupVideo = document.getElementById('popupVideo');
const closeBtn = document.querySelector('.close-btn');
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');
const closeSound = document.getElementById('closeSound');
let mouseX = 0;
let mouseY = 0;

const resetBtn = document.createElement('button');
resetBtn.className = 'pixel-btn reset-btn';
resetBtn.textContent = '↺ Reset';
document.body.appendChild(resetBtn);

document.addEventListener('mousemove', (e) => {
    const jarRect = container.getBoundingClientRect();
    mouseX = e.clientX - jarRect.left;
    mouseY = e.clientY - jarRect.top;
});

let specialHeart = null;

function createHeart(heartData, isRevival = false) {
    const heart = document.createElement('div');
    heart.className = `heart ${isRevival ? 'revive' : ''}`;
    
    const startX = Math.random() * (container.clientWidth - HEART_SIZE * 2) + HEART_SIZE;
    const startY = Math.random() * (container.clientHeight - HEART_SIZE * 2) + HEART_SIZE;
    
    heart.style.left = `${startX}px`;
    heart.style.top = `${startY}px`;
    heart.style.background = heartData.color || '#ff9ff3';
    heart.dataset.video = heartData.video;
    heart.dataset.heading = heartData.heading || '';
    heart.dataset.clicked = 'false';

    if (heartData.profile) {
        const profileDiv = document.createElement('div');
        profileDiv.className = 'heart-profile';
        const img = document.createElement('img');
        img.src = heartData.profile;
        img.alt = heartData.heading || 'Profile';

        profileDiv.appendChild(img);
        heart.appendChild(profileDiv);
    }

    if (hearts.indexOf(heartData) === 0) {
        specialHeart = heart;
        heart.classList.add('special-heart');
        heart.style.background = '#ff6b6b';
    }

    // Initialize physics state with random movement
    heartPhysics.set(heart, {
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 1.0,
        vy: (Math.random() - 0.5) * 1.0,
        driftPhase: Math.random() * Math.PI * 2
    });

    heart.addEventListener('click', function() {
        if (this.dataset.clicked === 'true' ||
            this.classList.contains('clicked') || 
            this.classList.contains('burst')) return;
        
        closeSound.currentTime = 0;
        closeSound.play();
        
        if (this === specialHeart) {
            const allHearts = Array.from(document.querySelectorAll('.heart'));
            const otherHearts = allHearts.filter(h => h !== specialHeart);
            const allOtherHeartsClicked = otherHearts.every(h => h.dataset.clicked === 'true');
            
            if (!allOtherHeartsClicked) {
                const physics = heartPhysics.get(this);
                const dx = mouseX - physics.x;
                const dy = mouseY - physics.y;
                const angle = Math.atan2(dy, dx);
                
                const escapeSpeed = 15 + (Math.random() * 5);
                const randomAngle = (Math.random() - 0.5) * 0.2;
                
                physics.vx = -Math.cos(angle + randomAngle) * escapeSpeed;
                physics.vy = -Math.sin(angle + randomAngle) * escapeSpeed;
                
                physics.vy -= 5;
                
                const trail = document.createElement('div');
                trail.className = 'heart-trail';
                trail.style.left = `${physics.x}px`;
                trail.style.top = `${physics.y}px`;
                container.appendChild(trail);
                
                trail.style.animation = 'trail 0.3s ease-out forwards';
                setTimeout(() => trail.remove(), 300);
                
                const rect = this.getBoundingClientRect();
                confetti({
                    particleCount: 10,
                    spread: 20,
                    origin: { 
                        x: (rect.left + rect.width/2) / window.innerWidth,
                        y: (rect.top + rect.height/2) / window.innerHeight
                    },
                    colors: ['#ff6b6b'],
                    shapes: ['square']
                });
                
                return;
            }
        }
        
        this.dataset.clicked = 'true';
        
        this.classList.add('burst');
        
        const rect = this.getBoundingClientRect();
        confetti({
            particleCount: 30,
            spread: 30,
            origin: { 
                x: (rect.left + rect.width/2) / window.innerWidth,
                y: (rect.top + rect.height/2) / window.innerHeight
            },
            colors: [heartData.color || '#ff9ff3', '#70a1ff'],
            shapes: ['square']
        });
        
        setTimeout(() => {
            popupVideo.src = this.dataset.video;
            const videoHeading = document.querySelector('.video-heading');
            if (videoHeading) {
                videoHeading.textContent = this.dataset.heading;
            }
            videoPopup.style.display = 'flex';
            
            popupVideo.volume = 1.0;
            popupVideo.play();
            
            bgMusic.volume = 0.05;
            
            popupVideo.onended = () => {
                this.classList.add('clicked');
                bgMusic.volume = 0.3;
            };
        }, 300);
    });

    container.appendChild(heart);
}

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.initial-overlay');
    const mainContent = document.querySelectorAll('.pixel-bg, .pixel-title, .jar, .music-control, .hearts-container');
    const startSound = document.getElementById('startSound');
    
    container.innerHTML = '';
    
    overlay.addEventListener('click', () => {
        startSound.currentTime = 0;
        startSound.play();
        
        overlay.classList.add('fade-out');
        
        mainContent.forEach(element => {
            element.classList.add('reveal-content');
        });
        
        bgMusic.play();
        musicBtn.textContent = '♪ Music ON';
        
        setTimeout(() => {
            // Create hearts with staggered delays
            hearts.forEach((heart, index) => {
                setTimeout(() => {
                    createHeart(heart);
                }, index * 500);
            });
            
            updateHearts();
            
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 2000);
        }, 1000);
    });

    addProfilePictures();
});

function updateHearts() {
    const jarRect = container.getBoundingClientRect();
    const jarWidth = jarRect.width - BOUNDARY_PADDING * 2;
    const jarHeight = jarRect.height - BOUNDARY_PADDING * 2;

    heartPhysics.forEach((physics, heart) => {
        physics.vy += Math.sin(physics.driftPhase) * VERTICAL_DRIFT;
        physics.driftPhase += 0.02;
        
        physics.vx += (Math.random() - 0.5) * RANDOM_FORCE;
        physics.vy += (Math.random() - 0.5) * RANDOM_FORCE;
        
        // Remove mouse interaction from physics
        // if (isMouseDown) {
        //     const dx = mouseX - physics.x;
        //     const dy = mouseY - physics.y;
        //     const distance = Math.sqrt(dx * dx + dy * dy);
            
        //     if (distance < 150) {
        //         const angle = Math.atan2(dy, dx);
        //         const force = (150 - distance) * 0.1;
        //         physics.vx += Math.cos(angle) * force;
        //         physics.vy += Math.sin(angle) * force;
        //     }
        // }

        physics.x += physics.vx;
        physics.y += physics.vy;

        physics.vx *= FRICTION;
        physics.vy *= FRICTION;

        if (physics.x < BOUNDARY_PADDING) {
            physics.x = BOUNDARY_PADDING;
            physics.vx *= -BOUNCE;
        } else if (physics.x > jarWidth - HEART_SIZE + BOUNDARY_PADDING) {
            physics.x = jarWidth - HEART_SIZE + BOUNDARY_PADDING;
            physics.vx *= -BOUNCE;
        }

        if (physics.y < BOUNDARY_PADDING + HEADING_ZONE_HEIGHT) {
            physics.y = BOUNDARY_PADDING + HEADING_ZONE_HEIGHT;
            physics.vy *= -BOUNCE;
            physics.vy += 0.2;
        } else if (physics.y > jarHeight - HEART_SIZE + BOUNDARY_PADDING) {
            physics.y = jarHeight - HEART_SIZE + BOUNDARY_PADDING;
            physics.vy *= -BOUNCE;
        }

        heart.style.left = `${physics.x}px`;
        heart.style.top = `${physics.y}px`;
    });

    const hearts = Array.from(heartPhysics.keys());
    for (let i = 0; i < hearts.length; i++) {
        for (let j = i + 1; j < hearts.length; j++) {
            checkHeartCollision(hearts[i], hearts[j]);
        }
    }

    requestAnimationFrame(updateHearts);
}

updateHearts();

closeBtn.addEventListener('click', () => {
    closeSound.currentTime = 0;
    closeSound.play();
    
    videoPopup.style.display = 'none';
    popupVideo.pause();
    
    bgMusic.volume = 0.3;
    
    const currentVideo = popupVideo.src;
    const heart = Array.from(document.querySelectorAll('.heart')).find(h => h.dataset.video === currentVideo);
    if (heart) {
        heart.classList.add('clicked');
        heart.dataset.clicked = 'true';
    }
});

resetBtn.addEventListener('click', () => {
    closeSound.currentTime = 0;
    closeSound.play();
    
    container.innerHTML = '';
    heartPhysics.clear();
    
    originalHearts.forEach(heart => createHeart(heart));
});

document.addEventListener('DOMContentLoaded', () => {
    bgMusic.volume = 0.3;
    let isMusicEnabled = false;
    let hasInteracted = false;

    function enableMusic() {
        if (!hasInteracted) {
            hasInteracted = true;
            bgMusic.play();
            musicBtn.textContent = '♪ Music ON';
            isMusicEnabled = true;
            
            document.removeEventListener('click', enableMusic);
        }
    }

    document.addEventListener('click', enableMusic);

    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        closeSound.currentTime = 0;
        closeSound.play();
        
        isMusicEnabled = !isMusicEnabled;
        
        if (isMusicEnabled) {
            bgMusic.play();
            musicBtn.textContent = '♪ Music ON';
        } else {
            bgMusic.pause();
            musicBtn.textContent = '♪ Music OFF';
        }
    });

    bgMusic.autoplay = false;
    bgMusic.pause();
    musicBtn.textContent = '♪ Click Anywhere';
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.3 },
            colors: ['#ff9ff3', '#70a1ff'],
            shapes: ['square']
        });
    }, 500);
});

function floatHearts() {
    document.querySelectorAll('.heart:not(.burst)').forEach(heart => {
        const driftX = Math.sin(Date.now() / 1000 + heart.offsetLeft) * 2;
        const driftY = Math.cos(Date.now() / 1000 + heart.offsetTop) * 2;
        heart.style.transform = `rotate(45deg) translate(${driftX}px, ${driftY}px)`;
    });
    requestAnimationFrame(floatHearts);
}
floatHearts();

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#ff9ff3', '#70a1ff', '#ffffff'],
            shapes: ['square', 'circle']
        });

        const unclickedHearts = Array.from(document.querySelectorAll('.heart')).filter(h => h.dataset.clicked === 'false');
        
        unclickedHearts.forEach(heart => {
            heart.classList.add('burst');
            
            const rect = heart.getBoundingClientRect();
            confetti({
                particleCount: 20,
                spread: 20,
                origin: { 
                    x: (rect.left + rect.width/2) / window.innerWidth,
                    y: (rect.top + rect.height/2) / window.innerHeight
                },
                colors: ['#ff9ff3', '#70a1ff'],
                shapes: ['square']
            });
        });
        
        setTimeout(() => {
            popupVideo.src = 'videos/special.mp4';
            videoPopup.style.display = 'flex';
            popupVideo.play();
            
            popupVideo.onended = () => {
                unclickedHearts.forEach(heart => {
                    heart.classList.add('clicked');
                    heart.dataset.clicked = 'true';
                });
                videoPopup.style.display = 'none';
            };
        }, 300);
    }
});

function checkHeartCollision(heart1, heart2) {
    const physics1 = heartPhysics.get(heart1);
    const physics2 = heartPhysics.get(heart2);
    
    const dx = physics1.x - physics2.x;
    const dy = physics1.y - physics2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < MIN_DISTANCE) {
        const overlap = MIN_DISTANCE - distance;
        
        const nx = dx / distance;
        const ny = dy / distance;
        
        const moveX = (overlap * nx) / 2;
        const moveY = (overlap * ny) / 2;
        
        physics1.x += moveX * 1.5;
        physics1.y += moveY * 1.5;
        physics2.x -= moveX * 1.5;
        physics2.y -= moveY * 1.5;
        
        const repulsion = REPULSION_FORCE * (1 - distance / MIN_DISTANCE);
        physics1.vx += nx * repulsion;
        physics1.vy += ny * repulsion;
        physics2.vx -= nx * repulsion;
        physics2.vy -= ny * repulsion;
        
        physics1.vx += (Math.random() - 0.5) * 0.2;
        physics1.vy += (Math.random() - 0.5) * 0.2;
        physics2.vx += (Math.random() - 0.5) * 0.2;
        physics2.vy += (Math.random() - 0.5) * 0.2;
    }
}

function addProfilePictures() {
    const hearts = document.querySelectorAll('.heart');
    hearts.forEach(heart => {
        const profilePath = heart.getAttribute('data-profile');
        if (profilePath) {
            const profileDiv = document.createElement('div');
            profileDiv.className = 'heart-profile';
            const img = document.createElement('img');
            img.src = profilePath;
            img.alt = 'Profile';
            profileDiv.appendChild(img);
            heart.appendChild(profileDiv);
        }
    });
}

