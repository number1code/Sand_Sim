(function() {
            // ==========================================================================
            // 1. SETUP & CONSTANTS
            // ==========================================================================
            
            const canvas = document.getElementById('game-canvas');
            const ctx = canvas.getContext('2d');

            // --- MODIFIED: Zoom and Timer variables ---
            // PIXELS_PER_METER is now a variable so we can change it for zooming.
            let pixelsPerMeter; 
            const INITIAL_ZOOM = 30;
            const MIN_ZOOM = 10;
            const MAX_ZOOM = 100;
            const ZOOM_SPEED = 1;

            // Timer variables have been removed.

            // Sand particle settings (unchanged)
            const INITIAL_PARTICLE_SIZE = 0.5;
            const MIN_PARTICLE_SIZE = 0.05;
            const SHRINK_RATE = 0.0005;
            
            // Global variables (unchanged)
            let world;
            const keys = {}; // Using an object to store key states is more flexible
            const mouse = { x: 0, y: 0, isDown: false };
            let camera = { x: 0, y: 0 };
            let pressStartTime = 0;
            let currentStreamColor = 'white';
            let particleInterval = null;
            const vec2 = planck.Vec2;


            // ==========================================================================
            // 2. WORLD & LEVEL CREATION (Unchanged)
            // ==========================================================================
            function createLevel() {
                while (world.getBodyList()) {
                    world.destroyBody(world.getBodyList());
                }
                world.createBody().createFixture(planck.Edge(vec2(-40, 20), vec2(40, 20)));
                world.createBody().createFixture(planck.Edge(vec2(-20, -20), vec2(-20, 20)));
                world.createBody().createFixture(planck.Edge(vec2(20, -20), vec2(20, 20)));

                for (let i = 0; i < 5; i++) {
                    const pitX = Math.random() * 30 - 15;
                    const pitY = Math.random() * 10 + 5;
                    const pitWidth = Math.random() * 3 + 2;
                    const pitDepth = Math.random() * 3 + 2;
                    const pitShape = [
                        vec2(pitX - pitWidth / 2, pitY),
                        vec2(pitX, pitY + pitDepth),
                        vec2(pitX + pitWidth / 2, pitY)
                    ];
                    world.createBody().createFixture(planck.Chain(pitShape, false));

                    const terraceX = Math.random() * 30 - 15;
                    const terraceY = Math.random() * 15 - 5;
                    const terraceWidth = Math.random() * 4 + 3;
                    const terraceAngle = Math.random() * Math.PI / 4 - Math.PI / 8;
                    const terrace = world.createBody({ position: vec2(terraceX, terraceY), angle: terraceAngle });
                    terrace.createFixture(planck.Box(terraceWidth / 2, 0.2));
                }
            }


            // ==========================================================================
            // 3. SAND PARTICLE CREATION (MODIFIED)
            // ==========================================================================
            function createSandParticle() {
                // MODIFIED: Uses the new 'pixelsPerMeter' variable for coordinate conversion.
                const worldX = (mouse.x - canvas.width / 2) / pixelsPerMeter + camera.x;
                const worldY = (mouse.y - canvas.height / 2) / pixelsPerMeter + camera.y;

                const holdDuration = Date.now() - pressStartTime;
                const size = Math.max(MIN_PARTICLE_SIZE, INITIAL_PARTICLE_SIZE - holdDuration * SHRINK_RATE);
                const body = world.createDynamicBody({ position: vec2(worldX, worldY) });
                body.createFixture(planck.Box(size / 2, size / 2), {
                    density: 4.0, friction: 0.5, restitution: 0.75
                });
                body.setUserData({ color: currentStreamColor });
            }


            // ==========================================================================
            // 4. DRAWING & RENDERING (MODIFIED)
            // ==========================================================================
            function draw() {
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                
                // MODIFIED: Uses the new 'pixelsPerMeter' variable for scaling.
                ctx.scale(pixelsPerMeter, pixelsPerMeter);
                
                ctx.translate(-camera.x, -camera.y);

                // The rest of the drawing logic is unchanged.
                for (let body = world.getBodyList(); body; body = body.getNext()) {
                    for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
                        const shape = fixture.getShape();
                        const type = shape.getType();
                        const position = body.getPosition();
                        const angle = body.getAngle();
                        ctx.fillStyle = body.isDynamic() ? body.getUserData().color : '#888';
                        
                        ctx.save();
                        ctx.translate(position.x, position.y);
                        ctx.rotate(angle);

                        if (type === 'box' || type === 'polygon') {
                            const vertices = shape.m_vertices;
                            ctx.beginPath();
                            ctx.moveTo(vertices[0].x, vertices[0].y);
                            for (let i = 1; i < vertices.length; i++) {
                                ctx.lineTo(vertices[i].x, vertices[i].y);
                            }
                            ctx.closePath();
                            ctx.fill();
                        } else if (type === 'chain') {
                            const vertices = shape.m_vertices;
                            ctx.strokeStyle = '#888';
                            ctx.lineWidth = 0.1;
                            ctx.beginPath();
                            ctx.moveTo(vertices[0].x, vertices[0].y);
                            for (let i = 1; i < vertices.length; i++) {
                                ctx.lineTo(vertices[i].x, vertices[i].y);
                            }
                            ctx.stroke();
                        } else if (type === 'edge') {
                            const v1 = shape.m_vertex1;
                            const v2 = shape.m_vertex2;
                            ctx.strokeStyle = '#888';
                            ctx.lineWidth = 0.1;
                            ctx.beginPath();
                            ctx.moveTo(v1.x, v1.y);
                            ctx.lineTo(v2.x, v2.y);
                            ctx.stroke();
                        }
                        
                        ctx.restore();
                    }
                }
                ctx.restore();
            }


            // ==========================================================================
            // 5. GAME LOOP & STATE MANAGEMENT (MODIFIED)
            // ==========================================================================
            function mainLoop() {
                world.step(1 / 60);

                // --- MODIFIED: Camera and Zoom logic ---
                const moveSpeed = 0.2;
                if (keys['w']) camera.y -= moveSpeed;
                if (keys['s']) camera.y += moveSpeed;
                if (keys['a']) camera.x -= moveSpeed;
                if (keys['d']) camera.x += moveSpeed;

                if (keys['q']) { // Zoom out
                    pixelsPerMeter = Math.max(MIN_ZOOM, pixelsPerMeter - ZOOM_SPEED);
                }
                if (keys['e']) { // Zoom in
                    pixelsPerMeter = Math.min(MAX_ZOOM, pixelsPerMeter + ZOOM_SPEED);
                }
                
                // --- REMOVED: Timer logic ---
                // The timer check and UI update have been removed from the main loop.

                draw();
                requestAnimationFrame(mainLoop);
            }

            // MODIFIED: Renamed function for clarity
            function resetLevel() {
                const explosionCenter = vec2(camera.x, camera.y);
                for (let body = world.getBodyList(); body; body = body.getNext()) {
                    if (body.isDynamic()) {
                        const direction = vec2.sub(body.getPosition(), explosionCenter);
                        direction.normalize();
                        const forceMagnitude = Math.random() * 500 + 200;
                        body.applyForceToCenter(direction.mul(forceMagnitude));
                    }
                }
                setTimeout(() => {
                    init();
                    // No need to restart the loop, it's already running.
                }, 1500);
            }


            // ==========================================================================
            // 6. EVENT LISTENERS (MODIFIED)
            // ==========================================================================
            
            window.addEventListener('keydown', e => {
                keys[e.key] = true;
                // --- NEW: Spacebar listener for resetting the level ---
                if (e.code === 'Space') {
                    e.preventDefault(); // Prevents page from scrolling down
                    resetLevel();
                }
            });
            window.addEventListener('keyup', e => {
                keys[e.key] = false;
            });

            // --- NEW: Mouse wheel listener for zooming ---
            canvas.addEventListener('wheel', e => {
                e.preventDefault(); // Prevents page from scrolling
                if (e.deltaY < 0) { // Scrolling up -> zoom in
                    pixelsPerMeter = Math.min(MAX_ZOOM, pixelsPerMeter + ZOOM_SPEED * 2); // Make wheel zoom a bit faster
                } else { // Scrolling down -> zoom out
                    pixelsPerMeter = Math.max(MIN_ZOOM, pixelsPerMeter - ZOOM_SPEED * 2);
                }
            });

            // Pointer listeners are unchanged
            canvas.addEventListener('pointerdown', e => {
                mouse.isDown = true;
                pressStartTime = Date.now();
                currentStreamColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
                if (particleInterval) clearInterval(particleInterval);
                particleInterval = setInterval(createSandParticle, 20);
            });
            window.addEventListener('pointerup', e => {
                mouse.isDown = false;
                if (particleInterval) clearInterval(particleInterval);
            });
            canvas.addEventListener('pointermove', e => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            });


            // ==========================================================================
            // 7. INITIALIZATION (MODIFIED)
            // ==========================================================================
            function init() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                world = planck.World({ gravity: vec2(0, 10) });

                // MODIFIED: Reset zoom and camera on init
                pixelsPerMeter = INITIAL_ZOOM;
                camera = { x: 0, y: 0 };
                
                createLevel();
            }

            // Start everything!
            init();
            requestAnimationFrame(mainLoop);
        })();