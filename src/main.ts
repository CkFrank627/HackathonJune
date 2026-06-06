import './style.css';

type GoodId =
  | 'water'
  | 'medicine'
  | 'ore'
  | 'fuel_cells'
  | 'star_silk'
  | 'alien_relics';

type LocationId = 'vega' | 'sirius' | 'nova7';

type Good = {
  id: GoodId;
  name: string;
};

type Location = {
  id: LocationId;
  name: string;
  description: string;
  prices: Record<GoodId, number>;
  routes: Partial<Record<LocationId, number>>;
};

type Player = {
  day: number;
  credits: number;
  fuel: number;
  locationId: LocationId;
  cargoCapacity: number;
  cargo: Partial<Record<GoodId, number>>;
};

const goods: Record<GoodId, Good> = {
  water: { id: 'water', name: 'Water' },
  medicine: { id: 'medicine', name: 'Medicine' },
  ore: { id: 'ore', name: 'Ore' },
  fuel_cells: { id: 'fuel_cells', name: 'Fuel Cells' },
  star_silk: { id: 'star_silk', name: 'Star Silk' },
  alien_relics: { id: 'alien_relics', name: 'Alien Relics' },
};

const locations: Record<LocationId, Location> = {
  vega: {
    id: 'vega',
    name: 'Vega Station',
    description: 'A polished trade hub orbiting a blue-white star.',
    prices: {
      water: 12,
      medicine: 95,
      ore: 35,
      fuel_cells: 50,
      star_silk: 210,
      alien_relics: 500,
    },
    routes: {
      sirius: 15,
      nova7: 30,
    },
  },
  sirius: {
    id: 'sirius',
    name: 'Sirius Outpost',
    description: 'A mining colony with cheap ore and nervous guards.',
    prices: {
      water: 18,
      medicine: 120,
      ore: 20,
      fuel_cells: 65,
      star_silk: 260,
      alien_relics: 620,
    },
    routes: {
      vega: 15,
      nova7: 20,
    },
  },
  nova7: {
    id: 'nova7',
    name: 'Nova-7 Colony',
    description: 'A frontier colony always short on supplies.',
    prices: {
      water: 35,
      medicine: 155,
      ore: 28,
      fuel_cells: 80,
      star_silk: 240,
      alien_relics: 700,
    },
    routes: {
      vega: 30,
      sirius: 20,
    },
  },
};

const player: Player = {
  day: 1,
  credits: 1200,
  fuel: 80,
  locationId: 'vega',
  cargoCapacity: 30,
  cargo: {},
};

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App element not found');
}

app.innerHTML = `
  <div class="era-window">
    <header class="era-header">
      <div>STAR TRADER</div>
      <div id="header-location"></div>
      <div id="header-day"></div>
    </header>

    <main class="era-main">
      <section class="era-log" id="log"></section>

      <aside class="era-sidebar">
        <section class="era-box">
          <h2>STATUS</h2>
          <div id="status"></div>
        </section>

        <section class="era-box">
          <h2>CARGO</h2>
          <div id="cargo"></div>
        </section>

        <section class="era-box">
          <h2>MARKET</h2>
          <div id="market"></div>
        </section>
      </aside>
    </main>

    <footer class="era-command-area">
      <div class="era-command-title">COMMAND</div>
      <div id="commands" class="era-command-grid"></div>

      <form id="manual-form" class="manual-form">
        <span>&gt;</span>
        <input id="manual-input" placeholder="type command, e.g. buy water 3" autocomplete="off" />
      </form>
    </footer>
  </div>
`;

const logEl = document.querySelector<HTMLDivElement>('#log')!;
const statusEl = document.querySelector<HTMLDivElement>('#status')!;
const cargoEl = document.querySelector<HTMLDivElement>('#cargo')!;
const marketEl = document.querySelector<HTMLDivElement>('#market')!;
const commandsEl = document.querySelector<HTMLDivElement>('#commands')!;
const headerLocationEl = document.querySelector<HTMLDivElement>('#header-location')!;
const headerDayEl = document.querySelector<HTMLDivElement>('#header-day')!;
const manualForm = document.querySelector<HTMLFormElement>('#manual-form')!;
const manualInput = document.querySelector<HTMLInputElement>('#manual-input')!;

function currentLocation(): Location {
  return locations[player.locationId];
}

function cargoUsed(): number {
  return Object.values(player.cargo).reduce((sum, amount) => sum + (amount ?? 0), 0);
}

function log(message: string): void {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = message;
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

function render(): void {
  const location = currentLocation();

  headerLocationEl.textContent = location.name;
  headerDayEl.textContent = `DAY ${player.day}`;

  statusEl.innerHTML = `
    <div class="stat-row"><span>Credits</span><strong>${player.credits}</strong></div>
    <div class="stat-row"><span>Fuel</span><strong>${player.fuel}</strong></div>
    <div class="stat-row"><span>Location</span><strong>${location.name}</strong></div>
    <div class="stat-row"><span>Cargo</span><strong>${cargoUsed()} / ${player.cargoCapacity}</strong></div>
  `;

  const cargoEntries = Object.entries(player.cargo);

  cargoEl.innerHTML =
    cargoEntries.length === 0
      ? `<div class="muted">Empty</div>`
      : cargoEntries
          .map(([goodId, amount]) => {
            const good = goods[goodId as GoodId];
            return `<div class="stat-row"><span>${good.name}</span><strong>${amount}</strong></div>`;
          })
          .join('');

  marketEl.innerHTML = Object.values(goods)
    .map((good) => {
      const price = location.prices[good.id];
      return `<div class="stat-row"><span>${good.name}</span><strong>${price}</strong></div>`;
    })
    .join('');

  renderCommands();
}

function renderCommands(): void {
  const location = currentLocation();
  let index = 1;

  const commandButtons: { label: string; command: string }[] = [
    { label: 'Status', command: 'status' },
    { label: 'Market', command: 'market' },
    { label: 'Buy Water', command: 'buy water 1' },
    { label: 'Buy Medicine', command: 'buy medicine 1' },
    { label: 'Sell Water', command: 'sell water 1' },
    { label: 'Sell Medicine', command: 'sell medicine 1' },
  ];

  for (const [destinationId, fuelCost] of Object.entries(location.routes)) {
    const destination = locations[destinationId as LocationId];
    commandButtons.push({
      label: `Travel ${destination.name} (${fuelCost} fuel)`,
      command: `travel ${destinationId}`,
    });
  }

  commandButtons.push({ label: 'Clear Log', command: 'clear' });

  commandsEl.innerHTML = commandButtons
    .map((button) => {
      const number = index++;
      return `
        <button class="command-button" data-command="${button.command}">
          <span class="command-number">${number}</span>
          ${button.label}
        </button>
      `;
    })
    .join('');

  document.querySelectorAll<HTMLButtonElement>('.command-button').forEach((button) => {
    button.addEventListener('click', () => {
      executeCommand(button.dataset.command ?? '');
    });
  });
}

function showStatus(): void {
  const location = currentLocation();

  log(
    `STATUS
Credits: ${player.credits}
Fuel: ${player.fuel}
Location: ${location.name}
Cargo: ${cargoUsed()} / ${player.cargoCapacity}`
  );
}

function showMarket(): void {
  const location = currentLocation();

  const lines = Object.values(goods)
    .map((good) => `${good.name.padEnd(14)} ${location.prices[good.id]} credits`)
    .join('\n');

  log(`MARKET - ${location.name}\n${lines}`);
}

function buy(goodId: string, amountText: string): void {
  const good = goods[goodId as GoodId];
  const amount = Number(amountText);

  if (!good || !Number.isInteger(amount) || amount <= 0) {
    log('Invalid purchase. Example: buy water 3');
    return;
  }

  const location = currentLocation();
  const totalCost = location.prices[good.id] * amount;

  if (player.credits < totalCost) {
    log(`Not enough credits. Need ${totalCost} credits.`);
    return;
  }

  if (cargoUsed() + amount > player.cargoCapacity) {
    log('Not enough cargo space.');
    return;
  }

  player.credits -= totalCost;
  player.cargo[good.id] = (player.cargo[good.id] ?? 0) + amount;

  log(`Bought ${amount} ${good.name} for ${totalCost} credits.`);
}

function sell(goodId: string, amountText: string): void {
  const good = goods[goodId as GoodId];
  const amount = Number(amountText);

  if (!good || !Number.isInteger(amount) || amount <= 0) {
    log('Invalid sale. Example: sell water 3');
    return;
  }

  const owned = player.cargo[good.id] ?? 0;

  if (owned < amount) {
    log(`You do not have enough ${good.name}.`);
    return;
  }

  const location = currentLocation();
  const earned = location.prices[good.id] * amount;

  player.credits += earned;
  player.cargo[good.id] = owned - amount;

  if (player.cargo[good.id] === 0) {
    delete player.cargo[good.id];
  }

  log(`Sold ${amount} ${good.name} for ${earned} credits.`);
}

function travel(destinationId: string): void {
  const location = currentLocation();
  const destination = locations[destinationId as LocationId];
  const fuelCost = location.routes[destinationId as LocationId];

  if (!destination || fuelCost === undefined) {
    log('Unknown route.');
    return;
  }

  if (player.fuel < fuelCost) {
    log(`Not enough fuel. Need ${fuelCost} fuel.`);
    return;
  }

  player.fuel -= fuelCost;
  player.locationId = destination.id;
  player.day += 1;

  log(`You travel to ${destination.name}.\n${destination.description}`);
}

function executeCommand(command: string): void {
  const parts = command.trim().toLowerCase().split(/\s+/);
  const action = parts[0];

  if (!action) return;

  if (action !== 'clear') {
    log(`> ${command}`);
  }

  if (action === 'status') {
    showStatus();
  } else if (action === 'market') {
    showMarket();
  } else if (action === 'buy') {
    buy(parts[1], parts[2]);
  } else if (action === 'sell') {
    sell(parts[1], parts[2]);
  } else if (action === 'travel') {
    travel(parts[1]);
  } else if (action === 'clear') {
    logEl.innerHTML = '';
  } else {
    log(`Unknown command: ${command}`);
  }

  render();
}

manualForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const command = manualInput.value;
  manualInput.value = '';

  executeCommand(command);
});

log('You wake in the cargo bay of a small merchant ship.');
log('The docking lights of Vega Station flicker beyond the viewport.');
log('Choose a command below, or type one manually.');

render();