# Pixi.js Slot Machine

A slot machine game demo built with TypeScript, Pixi.js v8, and Vite. Uses an event-driven architecture.

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun test
```

## Deploy

```bash
bun run deploy
```

Builds, commits, and pushes the `docs` folder to GitHub Pages.

**Prerequisites:**
- Git CLI authenticated (e.g., SSH key or token configured)
- Configure your repo: Settings → Pages → Deploy from branch → `main` → `/docs`

## How to Play

- Use **+** and **-** buttons to adjust your bet.
- Click **SPIN** to play.
- Win by matching symbols on horizontal paylines. Multi-line wins supported.
- Press **W** to force a winning spin (for testing).

## Features

- 5x5 grid slot machine.
- Weighted symbol selection with Wild substitution.
- Animated reel spins with staggered timing.
- Winning line detection and highlighting.
- Balance and bet management.
- Event-driven architecture for loose coupling.

## Architecture

### Event-Driven UI System

Components communicate through a central event bus. No direct dependencies between UI elements.

```
┌─────────────────────────────────────────┐
│           UIEventBus                    │
│  (Central communication hub)            │
└─────────────────────────────────────────┘
     ▲              ▲              ▲
     │              │              │
┌────┴────┐   ┌────┴────┐   ┌────┴────┐
│ Buttons │   │ Fields  │   │  Reels  │
└─────────┘   └─────────┘   └─────────┘
                   ▲
                   │
          ┌────────┴─────────┐
          │ SpinCoordinator  │
          └──────────────────┘
```

**Event Flow:**

`SPIN_REQUESTED` → `SPIN_STARTED` → `REEL_SPIN_STARTED` → `REEL_SPIN_COMPLETED` → `SPIN_COMPLETED` → `WIN_OCCURRED`

### Slot Engine

The `SlotMachine` class handles core game logic.

- Weighted random symbol selection uses a binary search algorithm.
- Wild symbols substitute for any symbol.
- Horizontal paylines check all five rows.
- Win multipliers calculate based on symbol rarity.
- Force-win mode generates guaranteed winning grids for testing.

## File Structure

```
src/
├── config.ts                      # Game constants and configuration
├── main.ts                        # App initialization
├── slotEngine.ts                  # Core slot logic
│
├── controllers/
│   └── gameController.ts          # Balance and bet state
│
├── ui/                            # Pixi.js UI components
│   ├── events/
│   │   ├── EventBus.ts           # Generic event emitter
│   │   └── index.ts              # Type-safe event definitions
│   ├── spinCoordinator.ts        # Orchestrates spin sequence
│   ├── slotMachine.ts            # Main UI container
│   ├── controlBar.ts             # Bottom control panel
│   ├── layout.ts                 # Responsive layout
│   ├── buttons/
│   │   ├── button.ts             # Base button component
│   │   ├── buttonBet.ts          # +/- bet buttons
│   │   └── buttonSpin.ts         # Spin button
│   ├── fields/
│   │   ├── field.ts              # Base field component
│   │   ├── fieldBet.ts           # Current bet display
│   │   └── fieldWin.ts           # Win amount display
│   └── reels/
│       ├── reel.ts               # Individual reel animation
│       ├── reelFrame.ts          # Reel background frame
│       ├── reelSeparators.ts     # Visual separators
│       └── symbol.ts             # Symbol sprite
│
└── utils/
    ├── assetLoader.ts             # Texture loading
    ├── rng.ts                     # Weighted random generation
    ├── logger.ts                  # Logging interface
    └── eventCleanup.ts            # Memory leak prevention
```

## Implementation Details

### Type-Safe Events

All events use strongly typed payloads.

TypeScript provides autocomplete and compile-time checks.

```typescript
eventBus.emitSpinCompleted({
    result: spinResult,
    finalBalance: 150,
});
```

### Configuration-Driven Design

All game parameters live in `config.ts`.

- Symbol weights and multipliers.
- Animation timings and easing functions.
- UI dimensions and colors.
- Bet amounts and starting balance.

### Weighted RNG System

Symbols have different rarity levels.

For example:
- CHERRY appears 60% of the time.
- SEVEN appears 0.5% of the time.

Binary search selects symbols efficiently.

## Testing

Run `bun test` for the full test suite.

## Notes

- This demo uses client-side RNG and validations
- **Production requires server-side validations and RNG**
- Assets load from `public/assets/`
