# Interactive 2D Physics Sandbox

A browser-based 2D physics sandbox built with vanilla JavaScript and the **Plank.js** physics engine. This project is a demonstration of real-time physics simulation, dynamic object creation, and user interaction within an HTML5 `<canvas>` environment.

The core feature is a "sand simulation" where users can generate a stream of particles that interact realistically with a procedurally generated environment.


---

### ✨ Features

*   **Real-Time Physics:** All object interactions are powered by the Plank.js (a JavaScript rewrite of Box2D) physics engine, simulating gravity, friction, and collisions.
*   **Dynamic Sand Generation:** Click and hold the mouse to create a continuous stream of sand particles. The longer you hold, the smaller and more granular the particles become.
*   **Procedurally Generated Levels:** Each session creates a unique level with randomly placed static geometry, including concave "pits" and sloped "terraces," ensuring a different simulation every time.
*   **Camera Controls:** The user can pan the view around the world using the **WASD** keys and zoom in and out using the **Mouse Wheel** or **Q/E** keys.
*   **Manual Reset & Explosion:** Press the **Spacebar** at any time to trigger a fun "explosion" that sends all sand particles flying before resetting the level.
*   **Custom Rendering:** The entire simulation is rendered to an HTML5 `<canvas>` using the 2D rendering context, with custom logic to draw each physics body.

### 🛠️ Technologies Used

*   **HTML5**
*   **CSS3**
*   **JavaScript (ES6+)**
    *   `requestAnimationFrame` for the main game loop
    *   Event Listeners for user input (keyboard and mouse)
    *   Dynamic DOM manipulation (UI overlay)
*   **Plank.js:** The core 2D physics engine, loaded via CDN.
*   **Graphics:** HTML5 `<canvas>` 2D API.

### 🚀 How to Run

No special setup, servers, or build steps are required.

1.  Clone this repository to your local machine.
2.  Simply open the `index.html` file in any modern web browser.

### Controls

| Action             | Control                |
| ------------------ | ---------------------- |
| **Move Camera**    | `W`, `A`, `S`, `D` Keys  |
| **Zoom In / Out**  | `Mouse Wheel` or `Q`/`E` Keys |
| **Create Sand**    | `Click and Hold` Mouse Button |
| **Reset Level**    | `Spacebar` Key         |

### How It Works

The simulation runs in a continuous loop powered by `requestAnimationFrame`. In each frame:
1.  **User input is processed:** The camera position and zoom level are updated based on key presses.
2.  **The physics world is stepped forward:** Plank.js calculates the new positions and velocities of all dynamic bodies (the sand particles) based on forces like gravity and collisions.
3.  **The scene is rendered:** The canvas is cleared, and custom drawing logic iterates through every body in the physics world, drawing a corresponding shape (a square, line, or chain) on the canvas based on its position, angle, and type.
4.  **New particles are created** if the user is holding the mouse down, adding them to the simulation for the next frame.
