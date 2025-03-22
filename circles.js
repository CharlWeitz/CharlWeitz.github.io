let circles = [];
        let settings = {
            numCircles: 50,
            minRadius: 5,
            maxRadius: 30,
            connectionDistance: 120
        };
        const backgroundColor = 240;
        
        function setup() {
            // Create canvas that fills the screen
            let canvas = createCanvas(windowWidth, windowHeight);
            canvas.parent('p5-canvas');
            
            // Initialize with default settings
            initializeCircles();
            
            // Set drawing properties
            strokeWeight(0.5);
            background(backgroundColor);
            
        }
        
        function initializeCircles() {
            circles = [];
            // Create circles with random positions and velocities
            for (let i = 0; i < settings.numCircles; i++) {
                circles.push({
                    position: createVector(random(width), random(height)),
                    velocity: createVector(random(-1, 1), random(-1, 1)),
                    radius: random(settings.minRadius, settings.maxRadius),
                    strokeColor: color(random(30, 80), random(30, 80), random(30, 80), 200)
                });
            }
        }
        
        function updateSettings() {
            // Get values from input fields
            const numCircles = parseInt(document.getElementById('numCircles').value);
            const minRadius = parseInt(document.getElementById('minRadius').value);
            const maxRadius = parseInt(document.getElementById('maxRadius').value);
            const connectionDistance = parseInt(document.getElementById('connectionDistance').value);
            
            // Validate inputs
            if (numCircles >= 5 && numCircles <= 100 &&
                minRadius >= 2 && minRadius <= 50 &&
                maxRadius >= minRadius && maxRadius <= 100 &&
                connectionDistance >= 50 && connectionDistance <= 300) {
                
                // Update settings
                settings.numCircles = numCircles;
                settings.minRadius = minRadius;
                settings.maxRadius = maxRadius;
                settings.connectionDistance = connectionDistance;
                
                // Reinitialize circles with new settings
                initializeCircles();
            } else {
                alert('Please check your input values. Ensure maximum radius is greater than minimum radius.');
            }
        }
        
        function draw() {
            // Clear background completely (no trail effect)
            background(backgroundColor);
            
            // Update and draw each circle
            for (let i = 0; i < circles.length; i++) {
                const circle = circles[i];
                
                // Update position
                circle.position.add(circle.velocity);
                
                // Bounce off edges
                if (circle.position.x < 0 || circle.position.x > width) {
                    circle.velocity.x *= -1;
                }
                if (circle.position.y < 0 || circle.position.y > height) {
                    circle.velocity.y *= -1;
                }
                
                // Draw connections to nearby circles
                for (let j = i + 1; j < circles.length; j++) {
                    const otherCircle = circles[j];
                    const distance = p5.Vector.dist(circle.position, otherCircle.position);
                    
                    if (distance < settings.connectionDistance) {
                        // Calculate opacity based on distance (closer = more opaque)
                        const opacity = map(distance, 0, settings.connectionDistance, 100, 10);
                        stroke(100, 100, 200, opacity);
                        
                        // Draw the connection line
                        line(
                            circle.position.x, 
                            circle.position.y, 
                            otherCircle.position.x, 
                            otherCircle.position.y
                        );
                    }
                }
                
                // Draw the circle with only stroke (outline), no fill
                noFill();
                stroke(circle.strokeColor);
                strokeWeight(1);
                ellipse(circle.position.x, circle.position.y, circle.radius * 2);
            }
        }
        
        // Resize canvas when the window is resized
        function windowResized() {
            resizeCanvas(windowWidth, windowHeight);
        }