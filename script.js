/**
 * ============================================================
 *  SORT LAB — script.js
 *  Sorting Visualizer: Bubble, Selection, Insertion,
 *                      Quick Sort, Merge Sort
 *  Step-based navigation with full forward/backward support.
 * ============================================================
 */

/* ──────────────────────────────────────────────
   1. DOM REFERENCES
   ────────────────────────────────────────────── */
const barContainer      = document.getElementById('barContainer');
const algorithmSelect   = document.getElementById('algorithmSelect');
const arraySizeSlider   = document.getElementById('arraySizeSlider');
const speedSlider       = document.getElementById('speedSlider');
const generateBtn       = document.getElementById('generateBtn');
const playBtn           = document.getElementById('playBtn');
const prevBtn           = document.getElementById('prevBtn');
const nextBtn           = document.getElementById('nextBtn');
const sizeLabel         = document.getElementById('sizeLabel');
const speedLabel        = document.getElementById('speedLabel');
const stepDisplay       = document.getElementById('stepDisplay');
const progressFill      = document.getElementById('progressFill');
const statusMsg         = document.getElementById('statusMsg');
const timeComplexity    = document.getElementById('timeComplexity');
const spaceComplexity   = document.getElementById('spaceComplexity');
const complexityNote    = document.getElementById('complexityNote');

/* ──────────────────────────────────────────────
   2. STATE
   ────────────────────────────────────────────── */
let array        = [];       // current working array
let steps        = [];       // all recorded steps
let currentStep  = -1;       // index into steps[]
let isPlaying    = false;    // auto-play flag
let playTimer    = null;     // setInterval handle

/* ──────────────────────────────────────────────
   3. ALGORITHM METADATA
   ────────────────────────────────────────────── */
const ALGO_INFO = {
  bubble: {
    time:  'O(n²)',
    space: 'O(1)',
    note:  'Compares adjacent elements and swaps if out of order. Repeats until no swaps needed.',
  },
  selection: {
    time:  'O(n²)',
    space: 'O(1)',
    note:  'Finds the minimum element from the unsorted part and places it at the beginning.',
  },
  insertion: {
    time:  'O(n²)',
    space: 'O(1)',
    note:  'Builds a sorted list one element at a time by inserting each into its correct position.',
  },
  quick: {
    time:  'O(n log n)',
    space: 'O(log n)',
    note:  'Picks a pivot, partitions elements around it, then recursively sorts each partition.',
  },
  merge: {
    time:  'O(n log n)',
    space: 'O(n)',
    note:  'Divides array in half repeatedly, then merges sorted halves back together.',
  },
};

/* ──────────────────────────────────────────────
   4. SPEED MAP  (ms delay between auto-steps)
   ────────────────────────────────────────────── */
const SPEED_MAP = { 1: 700, 2: 400, 3: 200, 4: 80, 5: 20 };
const SPEED_LABELS = { 1: 'Very Slow', 2: 'Slow', 3: 'Medium', 4: 'Fast', 5: 'Turbo' };

/* ──────────────────────────────────────────────
   5. STEP STRUCTURE
   Each step = {
     array:    number[]          — full array state
     compare:  number[]          — indices being compared  (red)
     sorted:   number[]          — indices already sorted  (green)
     pivot:    number | null     — highlighted index        (yellow)
     message:  string            — human-readable description
   }
   ────────────────────────────────────────────── */

/* ──────────────────────────────────────────────
   6. SORTING ALGORITHMS  (generate steps only)
   ────────────────────────────────────────────── */

/**
 * Bubble Sort — generates all intermediate steps.
 * @param {number[]} arr - input array (will be copied)
 * @returns {Object[]} steps array
 */
function generateBubbleSortSteps(arr) {
  const s = [];
  const a = [...arr];
  const n = a.length;
  const sortedSet = new Set();

  // Initial state
  s.push({ array: [...a], compare: [], sorted: [], pivot: null,
    message: 'Starting Bubble Sort. Click Next or Play.' });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - 1 - i; j++) {

      // Highlight comparison
      s.push({ array: [...a], compare: [j, j + 1], sorted: [...sortedSet],
        pivot: null,
        message: `Pass ${i + 1}: Comparing a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}.` });

      if (a[j] > a[j + 1]) {
        // Swap
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        s.push({ array: [...a], compare: [j, j + 1], sorted: [...sortedSet],
          pivot: null,
          message: `Swapped! a[${j}] ↔ a[${j+1}]. New values: ${a[j]}, ${a[j+1]}.` });
      }
    }

    // The last element of this pass is now in its final position
    sortedSet.add(n - 1 - i);
    s.push({ array: [...a], compare: [], sorted: [...sortedSet],
      pivot: null,
      message: `Pass ${i + 1} complete. Element ${a[n-1-i]} is now sorted.` });

    if (!swapped) {
      // Early exit — mark everything sorted
      for (let k = 0; k < n; k++) sortedSet.add(k);
      s.push({ array: [...a], compare: [], sorted: [...sortedSet],
        pivot: null, message: 'No swaps in last pass — array is sorted! 🎉' });
      return s;
    }
  }

  // Final state
  sortedSet.add(0);
  s.push({ array: [...a], compare: [], sorted: [...sortedSet],
    pivot: null, message: 'Bubble Sort complete! Array is fully sorted. 🎉' });
  return s;
}

/**
 * Selection Sort — generates all intermediate steps.
 */
function generateSelectionSortSteps(arr) {
  const s = [];
  const a = [...arr];
  const n = a.length;
  const sortedSet = new Set();

  s.push({ array: [...a], compare: [], sorted: [], pivot: null,
    message: 'Starting Selection Sort. Click Next or Play.' });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    // Highlight current minimum candidate
    s.push({ array: [...a], compare: [], sorted: [...sortedSet],
      pivot: minIdx,
      message: `Round ${i + 1}: Looking for minimum starting at index ${i}.` });

    for (let j = i + 1; j < n; j++) {
      // Compare current element with running minimum
      s.push({ array: [...a], compare: [j, minIdx], sorted: [...sortedSet],
        pivot: minIdx,
        message: `Comparing a[${j}]=${a[j]} with current min a[${minIdx}]=${a[minIdx]}.` });

      if (a[j] < a[minIdx]) {
        minIdx = j;
        s.push({ array: [...a], compare: [], sorted: [...sortedSet],
          pivot: minIdx,
          message: `New minimum found: a[${minIdx}]=${a[minIdx]}.` });
      }
    }

    // Swap minimum into position i
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      s.push({ array: [...a], compare: [i, minIdx], sorted: [...sortedSet],
        pivot: null,
        message: `Swapping minimum ${a[i]} into position ${i}.` });
    }

    sortedSet.add(i);
    s.push({ array: [...a], compare: [], sorted: [...sortedSet],
      pivot: null,
      message: `Position ${i} is now sorted with value ${a[i]}.` });
  }

  sortedSet.add(n - 1);
  s.push({ array: [...a], compare: [], sorted: [...sortedSet],
    pivot: null, message: 'Selection Sort complete! Array is fully sorted. 🎉' });
  return s;
}

/**
 * Insertion Sort — generates all intermediate steps.
 */
function generateInsertionSortSteps(arr) {
  const s = [];
  const a = [...arr];
  const n = a.length;
  const sortedSet = new Set([0]);

  s.push({ array: [...a], compare: [], sorted: [...sortedSet], pivot: null,
    message: 'Starting Insertion Sort. First element is trivially sorted.' });

  for (let i = 1; i < n; i++) {
    const key = a[i];

    s.push({ array: [...a], compare: [], sorted: [...sortedSet],
      pivot: i,
      message: `Inserting a[${i}]=${key} into the sorted portion.` });

    let j = i - 1;

    while (j >= 0 && a[j] > key) {
      // Compare key against the element to its left
      s.push({ array: [...a], compare: [j, j + 1], sorted: [...sortedSet],
        pivot: j + 1,
        message: `a[${j}]=${a[j]} > ${key}, shifting right.` });

      a[j + 1] = a[j];
      s.push({ array: [...a], compare: [], sorted: [...sortedSet],
        pivot: j + 1,
        message: `Shifted a[${j}]=${a[j]} one position to the right.` });

      j--;
    }

    a[j + 1] = key;
    sortedSet.add(i);

    s.push({ array: [...a], compare: [], sorted: [...sortedSet],
      pivot: j + 1,
      message: `Placed ${key} at position ${j + 1}. Sorted portion now has ${i + 1} elements.` });
  }

  s.push({ array: [...a], compare: [], sorted: [...Array.from({length: n}, (_, k) => k)],
    pivot: null, message: 'Insertion Sort complete! Array is fully sorted. 🎉' });
  return s;
}

/**
 * Quick Sort — generates all intermediate steps.
 * Uses last element as pivot, Lomuto partition scheme.
 */
function generateQuickSortSteps(arr) {
  const s = [];
  const a = [...arr];
  const n = a.length;
  const sortedSet = new Set();

  s.push({ array: [...a], compare: [], sorted: [...sortedSet], pivot: null,
    message: 'Starting Quick Sort. Click Next or Play.' });

  function partition(low, high) {
    const pivotVal = a[high];
    s.push({ array: [...a], compare: [], sorted: [...sortedSet],
      pivot: high,
      message: `Partition [${low}..${high}]: Pivot = ${pivotVal} (index ${high}).` });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      s.push({ array: [...a], compare: [j, high], sorted: [...sortedSet],
        pivot: high,
        message: `Comparing a[${j}]=${a[j]} with pivot ${pivotVal}.` });

      if (a[j] <= pivotVal) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          s.push({ array: [...a], compare: [i, j], sorted: [...sortedSet],
            pivot: high,
            message: `a[${j}]=${a[j]} ≤ pivot. Swapping a[${i}] ↔ a[${j}].` });
        } else {
          s.push({ array: [...a], compare: [], sorted: [...sortedSet],
            pivot: high,
            message: `a[${j}]=${a[j]} ≤ pivot. Already in place.` });
        }
      }
    }

    // Place pivot in correct position
    const pivotPos = i + 1;
    if (pivotPos !== high) {
      [a[pivotPos], a[high]] = [a[high], a[pivotPos]];
      s.push({ array: [...a], compare: [pivotPos, high], sorted: [...sortedSet],
        pivot: pivotPos,
        message: `Placing pivot ${pivotVal} at its correct position ${pivotPos}.` });
    }

    sortedSet.add(pivotPos);
    s.push({ array: [...a], compare: [], sorted: [...sortedSet],
      pivot: null,
      message: `Pivot ${pivotVal} is now at its final position ${pivotPos}. ✓` });

    return pivotPos;
  }

  function quickSort(low, high) {
    if (low >= high) {
      if (low === high) {
        sortedSet.add(low);
        s.push({ array: [...a], compare: [], sorted: [...sortedSet],
          pivot: null,
          message: `Single element at index ${low} is trivially sorted.` });
      }
      return;
    }
    const pi = partition(low, high);
    quickSort(low, pi - 1);
    quickSort(pi + 1, high);
  }

  quickSort(0, n - 1);

  // Mark all sorted at the end just in case
  for (let k = 0; k < n; k++) sortedSet.add(k);
  s.push({ array: [...a], compare: [], sorted: [...sortedSet],
    pivot: null, message: 'Quick Sort complete! Array is fully sorted. 🎉' });

  return s;
}

/**
 * Merge Sort — generates all intermediate steps.
 * Iterative bottom-up approach for clean step recording.
 */
function generateMergeSortSteps(arr) {
  const s = [];
  const a = [...arr];
  const n = a.length;
  const sortedSet = new Set();

  s.push({ array: [...a], compare: [], sorted: [...sortedSet], pivot: null,
    message: 'Starting Merge Sort. Dividing array into sub-arrays.' });

  function merge(left, mid, right) {
    const leftArr  = a.slice(left, mid + 1);
    const rightArr = a.slice(mid + 1, right + 1);

    s.push({ array: [...a], compare: [], sorted: [...sortedSet],
      pivot: null,
      message: `Merging sub-arrays [${left}..${mid}] and [${mid+1}..${right}].` });

    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      const li = left + i;
      const rj = mid + 1 + j;

      s.push({ array: [...a], compare: [li, rj], sorted: [...sortedSet],
        pivot: null,
        message: `Comparing ${leftArr[i]} (left) vs ${rightArr[j]} (right).` });

      if (leftArr[i] <= rightArr[j]) {
        a[k] = leftArr[i];
        s.push({ array: [...a], compare: [], sorted: [...sortedSet],
          pivot: k,
          message: `Placing ${leftArr[i]} at index ${k}.` });
        i++;
      } else {
        a[k] = rightArr[j];
        s.push({ array: [...a], compare: [], sorted: [...sortedSet],
          pivot: k,
          message: `Placing ${rightArr[j]} at index ${k}.` });
        j++;
      }
      k++;
    }

    // Copy remaining elements from left half
    while (i < leftArr.length) {
      a[k] = leftArr[i];
      s.push({ array: [...a], compare: [], sorted: [...sortedSet],
        pivot: k,
        message: `Copying remaining left element ${leftArr[i]} to index ${k}.` });
      i++; k++;
    }

    // Copy remaining elements from right half
    while (j < rightArr.length) {
      a[k] = rightArr[j];
      s.push({ array: [...a], compare: [], sorted: [...sortedSet],
        pivot: k,
        message: `Copying remaining right element ${rightArr[j]} to index ${k}.` });
      j++; k++;
    }

    // Mark this merged range as sorted
    for (let x = left; x <= right; x++) sortedSet.add(x);
    s.push({ array: [...a], compare: [], sorted: [...sortedSet],
      pivot: null,
      message: `Merged [${left}..${right}] successfully.` });
  }

  function mergeSort(left, right) {
    if (left >= right) {
      sortedSet.add(left);
      return;
    }
    const mid = Math.floor((left + right) / 2);
    s.push({ array: [...a], compare: [], sorted: [...sortedSet],
      pivot: null,
      message: `Splitting [${left}..${right}] → [${left}..${mid}] and [${mid+1}..${right}].` });
    mergeSort(left, mid);
    mergeSort(mid + 1, right);
    merge(left, mid, right);
  }

  mergeSort(0, n - 1);

  for (let k = 0; k < n; k++) sortedSet.add(k);
  s.push({ array: [...a], compare: [], sorted: [...sortedSet],
    pivot: null, message: 'Merge Sort complete! Array is fully sorted. 🎉' });

  return s;
}

/* ──────────────────────────────────────────────
   7. RENDER
   ────────────────────────────────────────────── */

/**
 * Render the bar chart from a step object.
 * @param {Object} step
 */
function renderStep(step) {
  if (!step) return;
  const { array: arr, compare, sorted, pivot, message } = step;
  const maxVal = Math.max(...arr, 1);

  // Build bar elements
  barContainer.innerHTML = '';

  arr.forEach((val, idx) => {
    const bar = document.createElement('div');
    bar.className = 'bar';

    // Height as percentage of container
    const heightPct = (val / maxVal) * 90; // 90% max height
    bar.style.height = `${heightPct}%`;

    // Assign state class (priority: compare > pivot > sorted > default)
    if (compare && compare.includes(idx)) {
      bar.classList.add('comparing');
    } else if (pivot !== null && pivot === idx) {
      bar.classList.add('pivot');
    } else if (sorted && sorted.includes(idx)) {
      bar.classList.add('sorted');
    }

    barContainer.appendChild(bar);
  });

  // Update status message
  statusMsg.textContent = message || '';
}

/* ──────────────────────────────────────────────
   8. NAVIGATION
   ────────────────────────────────────────────── */

/** Move to a specific step index. */
function goToStep(idx) {
  if (steps.length === 0) return;
  currentStep = Math.max(0, Math.min(idx, steps.length - 1));
  renderStep(steps[currentStep]);
  updateUI();
}

/** Advance one step forward. */
function stepForward() {
  if (currentStep < steps.length - 1) goToStep(currentStep + 1);
  else stopPlay(); // reached end
}

/** Go one step backward. */
function stepBack() {
  if (currentStep > 0) goToStep(currentStep - 1);
}

/* ──────────────────────────────────────────────
   9. AUTO-PLAY
   ────────────────────────────────────────────── */

function startPlay() {
  if (steps.length === 0) return;
  if (currentStep >= steps.length - 1) goToStep(0); // restart from beginning

  isPlaying = true;
  updatePlayBtn();

  const delay = SPEED_MAP[Number(speedSlider.value)] || 200;
  playTimer = setInterval(() => {
    if (currentStep >= steps.length - 1) {
      stopPlay();
    } else {
      stepForward();
    }
  }, delay);
}

function stopPlay() {
  isPlaying = false;
  clearInterval(playTimer);
  playTimer = null;
  updatePlayBtn();
}

function togglePlay() {
  if (isPlaying) stopPlay();
  else startPlay();
}

/* ──────────────────────────────────────────────
   10. ARRAY GENERATION
   ────────────────────────────────────────────── */

/** Generate a new random array and compute all sorting steps. */
function generateArray() {
  stopPlay();

  const size = Number(arraySizeSlider.value);
  array = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);

  // Compute steps for selected algorithm
  const algo = algorithmSelect.value;
  if      (algo === 'bubble')    steps = generateBubbleSortSteps(array);
  else if (algo === 'selection') steps = generateSelectionSortSteps(array);
  else if (algo === 'insertion') steps = generateInsertionSortSteps(array);
  else if (algo === 'quick')     steps = generateQuickSortSteps(array);
  else if (algo === 'merge')     steps = generateMergeSortSteps(array);

  currentStep = 0;
  renderStep(steps[0]);
  updateUI();
}

/* ──────────────────────────────────────────────
   11. UI HELPERS
   ────────────────────────────────────────────── */

/** Sync all UI controls to current state. */
function updateUI() {
  // Step counter
  const total = steps.length > 0 ? steps.length - 1 : 0;
  stepDisplay.textContent = `Step ${currentStep} / ${total}`;

  // Progress bar
  const pct = total > 0 ? (currentStep / total) * 100 : 0;
  progressFill.style.width = `${pct}%`;

  // Buttons
  prevBtn.disabled = currentStep <= 0;
  nextBtn.disabled = currentStep >= steps.length - 1;
  playBtn.disabled = steps.length === 0;
}

/** Toggle the play/pause icon inside the play button. */
function updatePlayBtn() {
  const iconPlay  = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');
  iconPlay.style.display  = isPlaying ? 'none'  : '';
  iconPause.style.display = isPlaying ? ''      : 'none';
}

/** Update complexity info panel based on selected algorithm. */
function updateComplexityInfo() {
  const info = ALGO_INFO[algorithmSelect.value];
  timeComplexity.textContent  = info.time;
  spaceComplexity.textContent = info.space;
  complexityNote.textContent  = info.note;
}

/** Update the speed label. */
function updateSpeedLabel() {
  speedLabel.textContent = SPEED_LABELS[speedSlider.value] || 'Medium';
  // If currently playing, restart interval with new speed
  if (isPlaying) {
    stopPlay();
    startPlay();
  }
}

/* ──────────────────────────────────────────────
   12. EVENT LISTENERS
   ────────────────────────────────────────────── */

generateBtn.addEventListener('click', generateArray);

playBtn.addEventListener('click', togglePlay);

nextBtn.addEventListener('click', () => {
  stopPlay();
  stepForward();
});

prevBtn.addEventListener('click', () => {
  stopPlay();
  stepBack();
});

algorithmSelect.addEventListener('change', () => {
  updateComplexityInfo();
  generateArray(); // recompute steps for new algorithm
});

arraySizeSlider.addEventListener('input', () => {
  sizeLabel.textContent = arraySizeSlider.value;
  generateArray();
});

speedSlider.addEventListener('input', updateSpeedLabel);

/* Keyboard shortcuts */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { stopPlay(); stepForward(); }
  if (e.key === 'ArrowLeft')  { stopPlay(); stepBack(); }
  if (e.key === ' ')          { e.preventDefault(); togglePlay(); }
});

/* ──────────────────────────────────────────────
   13. INIT
   ────────────────────────────────────────────── */
updateComplexityInfo();
updateSpeedLabel();
generateArray();
