document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.querySelector('.startbutton');
  const startButtonContainer = document.querySelector('.start-button-container');
  const backgroundVideo = document.getElementById('background-video');
  const newBackgroundVideo = document.getElementById('new-background-video');
  const jumpyVideo = document.getElementById('jumpy-video');

  const alertDisplay = document.getElementById('alert');
  const pointsDisplay = document.getElementById('points');

  const modelViewer = document.querySelector('model-viewer');
  const loadingOverlay = document.getElementById('loading-overlay');

  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  const dragThreshold = 100; // Pixels to trigger the animation

  let carePoints = 0; // Initialize care points
  let currentAlert = null; // To track the current alert

  // Define possible alerts and their corresponding buttons
  const alerts = [
    { message: 'Thirsty', button: 'round-button3', action: 'drink' },
    { message: 'Needy', button: 'round-button2', action: 'care' },
    { message: 'Dancy', button: 'round-button2', action: 'dance' },
  ];

  // Function to update the points display
  const updatePoints = () => {
    pointsDisplay.textContent = `Points: ${carePoints}`;
    localStorage.setItem('carePoints', carePoints); // Persist points
  };

  // Function to display an alert
  const showAlert = (alert) => {
    currentAlert = alert;
    alertDisplay.textContent = alert.message;
    alertDisplay.style.display = 'block';
  };

  // Function to hide the alert
  const hideAlert = () => {
    alertDisplay.style.display = 'none';
    currentAlert = null;
  };

  // Function to trigger a random alert
  const triggerRandomAlert = () => {
    const randomIndex = Math.floor(Math.random() * alerts.length);
    const selectedAlert = alerts[randomIndex];
    showAlert(selectedAlert);
  };

  // Function to handle care point increment
  const handleCare = () => {
    if (currentAlert && currentAlert.action === 'care') {
      carePoints += 1;
      updatePoints();
      hideAlert();
      provideFeedback('You cared for your Tamagotchi!');
    } else if (currentAlert && currentAlert.action === 'dance') {
      carePoints += 1;
      updatePoints();
      hideAlert();
      provideFeedback('You danced with your Tamagotchi!');
    } else {
      // Optional: Provide feedback for incorrect action
      provideFeedback('Nothing happened. Maybe try the correct button next time!');
    }
  };

  // Function to handle drink point increment
  const handleDrink = () => {
    if (currentAlert && currentAlert.action === 'drink') {
      carePoints += 1;
      updatePoints();
      hideAlert();
      provideFeedback('You gave your Tamagotchi a drink!');
    } else {
      // Optional: Provide feedback for incorrect action
      provideFeedback('Nothing happened. Maybe try the correct button next time!');
    }
  };

  // Function to provide user feedback
  const provideFeedback = (message) => {
    alertDisplay.textContent = message;
    alertDisplay.style.display = 'block';
    setTimeout(() => {
      hideAlert();
    }, 2000); // Hide feedback after 2 seconds
  };

  // Function to animate the button out
  const animateOut = () => {
    startButtonContainer.classList.add('animate-out');

    // Change the video after the animation starts
    switchVideo();

    // Remove event listeners to prevent multiple triggers
    startButton.removeEventListener('click', handleClick);
    startButton.removeEventListener('touchstart', handleTouchStart);
    startButton.removeEventListener('keydown', handleKeyDown);

    // Optional: Remove the button from the DOM after the animation completes
    startButtonContainer.addEventListener(
      'transitionend',
      () => {
        startButtonContainer.style.display = 'none';
        // You can also trigger other actions here, such as starting the game
        // Example: startGame();
      },
      { once: true } // The { once: true } option ensures the listener is removed after it's called
    );
  };

  // Function to switch the background video to Namnlöst-2.mp4
  const switchVideo = () => {
    // Pause and hide the current video
    backgroundVideo.pause();
    backgroundVideo.style.display = 'none';

    // Show and play the new video
    newBackgroundVideo.style.display = 'block';
    newBackgroundVideo.currentTime = 0; // Start from the beginning
    newBackgroundVideo.play();

    // Listen for the 'ended' event to switch to jumpy-video
    newBackgroundVideo.addEventListener('ended', switchToJumpyVideo, { once: true });

    // Ensure the new background video does not loop
    newBackgroundVideo.loop = false;
  };

  // Function to switch to jumpy-video after Namnlöst-2.mp4 ends
  const switchToJumpyVideo = () => {
    // Hide the new background video
    newBackgroundVideo.style.display = 'none';

    // Show and play the jumpy video
    jumpyVideo.style.display = 'block';
    jumpyVideo.currentTime = 0; // Start from the beginning
    jumpyVideo.play();

    // Ensure the jumpy video loops
    jumpyVideo.loop = true;

    // Start the Tamagotchi game after the jumpy video starts playing
    jumpyVideo.addEventListener('play', startGame, { once: true });
  };

  // Function to start the Tamagotchi game
  const startGame = () => {
    // Initialize care points from localStorage
    if (localStorage.getItem('carePoints')) {
      carePoints = parseInt(localStorage.getItem('carePoints'), 10);
      updatePoints();
    }

    // Initial display
    triggerRandomAlert();

    // Set interval to trigger alerts every 15 seconds
    setInterval(() => {
      // Only trigger a new alert if no alert is currently active
      if (!currentAlert) {
        triggerRandomAlert();
      }
    }, 15000); // 15000 milliseconds = 15 seconds
  };

  // Handle Click Event
  const handleClick = () => {
    animateOut();
  };

  // Handle Touch Event for mobile devices
  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevents the click event from firing twice on some devices
    animateOut();
  };

  // Handle KeyDown Event for accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      animateOut();
    }
  };

  // Function to start dragging
  const startDrag = (clientX) => {
    isDragging = true;
    startX = clientX;
    currentX = clientX;

    // Disable transitions during drag for smoother movement
    startButtonContainer.style.transition = 'none';
  };

  // Function to drag
  const doDrag = (clientX) => {
    if (!isDragging) return;
    currentX = clientX;
    const deltaX = currentX - startX;

    // Only allow dragging to the right
    if (deltaX < 0) return;

    // Update the transform: translate(-50%, -50%) translateX(deltaX)
    startButtonContainer.style.transform = `translate(-50%, -50%) translateX(${deltaX}px)`;
  };

  // Function to end dragging
  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    const deltaX = currentX - startX;

    // Re-enable transitions for animation
    startButtonContainer.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';

    if (deltaX > dragThreshold) {
      // Trigger animate out if dragged beyond threshold
      animateOut();
    } else {
      // Animate back to original position
      startButtonContainer.style.transform = 'translate(-50%, -50%)';
    }
  };

  // Mouse Events
  startButton.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrag(e.clientX);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    doDrag(e.clientX);
  });

  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    endDrag();
  });

  // Touch Events for mobile devices
  startButton.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startDrag(touch.clientX);
  });

  startButton.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    doDrag(touch.clientX);
  });

  startButton.addEventListener('touchend', (e) => {
    endDrag();
  });

  // Accessibility: Handle key presses
  startButton.addEventListener('keydown', handleKeyDown);

  // Button 1 (Middle Button) Event Listener
  const middleButton = document.querySelector('.round-button');
  middleButton.addEventListener('click', () => {
    // Define functionality for the middle button if needed
    provideFeedback('I love you to<3!');
  });

  // Button 2 (Care/Dance) Event Listener
  const careButton = document.querySelector('.round-button2');
  careButton.addEventListener('click', handleCare);

  // Button 3 (Drink) Event Listener
  const drinkButton = document.querySelector('.round-button3');
  drinkButton.addEventListener('click', handleDrink);

  // Optional: Prevent context menu on long press for mobile devices
  careButton.addEventListener('contextmenu', (e) => e.preventDefault());
  drinkButton.addEventListener('contextmenu', (e) => e.preventDefault());
  middleButton.addEventListener('contextmenu', (e) => e.preventDefault());

  // Optional: Initialize points display
  updatePoints();

  // Hide the loading overlay once the 3D model is fully loaded
  modelViewer.addEventListener('load', () => {
    loadingOverlay.style.display = 'none';
  });

  // Optional: Handle errors during model loading
  modelViewer.addEventListener('error', (e) => {
    console.error('Error loading 3D model:', e);
    loadingOverlay.style.backgroundColor = '#000';
    loadingOverlay.innerHTML = `
      <p style="
        color: white; 
        position: absolute; 
        top: 50%; 
        left: 50%; 
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        text-align: center;
      ">
        Sorry, there was an error loading the 3D model.
      </p>
    `;
  });
});
