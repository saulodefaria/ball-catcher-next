# Ball Catcher App (Next.js Version)

An interactive game that uses computer vision to detect hand movements and catch falling balls, powered by [Roboflow](https://roboflow.com).

## Demo

Test the app at: https://catch.saulofaria.com/

Here's a quick demo in video: [Click here](https://www.loom.com/share/1dd3c0434f2e4cdd998974a5ced44f15?sid=6818d17d-1384-40a8-81f8-da972e41fbe1)

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Roboflow account with access to the hand detection model

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ball-catcher-next.git
   cd ball-catcher-next
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_INFERENCEJS_API_KEY=your_inferencejs_api_key
HAND_DETECTION_API_KEY=your_hand_detection_api_key
```

- `NEXT_PUBLIC_DEBUG` - Set to "true" to enable debug mode (shows hand detection boxes)
- `NEXT_PUBLIC_INFERENCEJS_API_KEY` - Your Roboflow API key for client-side inference
- `HAND_DETECTION_API_KEY` - Your Roboflow API key for server-side inference

## Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Game Features

- Multiple difficulty levels (Easy, Medium, Hard, Extreme)
- Score tracking
- Lives system with heart power-ups
- Real-time hand detection
- Smooth animations and visual feedback

## Development

- Built with Next.js 15 and TypeScript
- Uses Roboflow's InferenceJS for client-side hand detection
- Responsive design that works on various screen sizes

## Browser Compatibility

The app requires:

- A modern browser with WebRTC support for webcam access
- Hardware acceleration for optimal performance
- A working webcam
