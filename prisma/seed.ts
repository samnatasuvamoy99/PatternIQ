import { PrismaClient, Difficulty, ContentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding for Array Patterns...");

  // 1. Ensure Admin User
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@dsaplatform.com" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@dsaplatform.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("Seeded admin user:", admin.email);

  // 2. Ensure Student User
  const studentPasswordHash = await bcrypt.hash("Student@12345", 10);
  const student = await prisma.user.upsert({
    where: { email: "student@dsaplatform.com" },
    update: {},
    create: {
      name: "Test Student",
      email: "student@dsaplatform.com",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
    },
  });
  console.log("Seeded student user:", student.email);

  // 3. Ensure Topic: Array
  const topic = await prisma.topic.upsert({
    where: { slug: "array" },
    update: {
      name: "Array Patterns",
      description: "Array-based patterns for coding interviews & competitive programming (A2Z / TCS NQT Prep)",
    },
    create: {
      name: "Array Patterns",
      slug: "array",
      description: "Array-based patterns for coding interviews & competitive programming (A2Z / TCS NQT Prep)",
      order: 1,
      published: true,
    },
  });
  console.log("Seeded topic:", topic.name);

  // Array Patterns Data
  const arrayPatternsData = [
    {
      number: 1,
      name: "Two Pointer Pattern",
      slug: "two-pointer-pattern",
      shortDescription: "Two ends of array move inward or together to process pairs or swap in-place.",
      whatIsThis: "The Two Pointer pattern uses two indices (usually left and right) to traverse an array from both ends or in unison, optimizing O(N²) nested loops down to O(N).",
      intuition: "Instead of searching every pair with nested loops, leverage array sorting or relative positions to move pointers inward based on sum or comparison conditions.",
      coreIdea: "Maintain two pointers (e.g. left = 0, right = n - 1). Evaluate the condition at arr[left] and arr[right], then increment/decrement left or right pointers accordingly.",
      interviewRule: "Sorted array + 'find pair/triplet' → two pointer beats brute force O(n²).",
      difficulty: Difficulty.EASY,
      importance: 5,
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      status: ContentStatus.PUBLISHED,
      pseudocode: `int left = 0, right = n - 1;

while (left < right) {
    // check / process arr[left], arr[right]
    if (condition) left++;
    else right--;
}`,
      cppTemplate: `int left = 0, right = arr.size() - 1;
while (left < right) {
    if (arr[left] + arr[right] == target) return {left, right};
    else if (arr[left] + arr[right] < target) left++;
    else right--;
}`,
      javaTemplate: `int left = 0, right = arr.length - 1;
while (left < right) {
    if (arr[left] + arr[right] == target) return new int[]{left, right};
    else if (arr[left] + arr[right] < target) left++;
    else right--;
}`,
      jsTemplate: `let left = 0, right = arr.length - 1;
while (left < right) {
    if (arr[left] + arr[right] === target) return [left, right];
    else if (arr[left] + arr[right] < target) left++;
    else right--;
}`,
      useCases: [
        { content: "Two ends of array need to move inward or together", order: 0, isWhenNotToUse: false },
        { content: "Need to compare / swap elements without extra space", order: 1, isWhenNotToUse: false },
        { content: "Sorted array + target sum problems", order: 2, isWhenNotToUse: false }
      ],
      problems: [
        { title: "Reverse an Array in Place", slug: "reverse-array-in-place", solveUrl: "https://leetcode.com/problems/reverse-string/", difficulty: Difficulty.EASY },
        { title: "Pair with Given Sum (Two Sum Sorted)", slug: "two-sum-ii-input-array-is-sorted", solveUrl: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", difficulty: Difficulty.EASY },
        { title: "Remove Duplicates from Sorted Array", slug: "remove-duplicates-from-sorted-array", solveUrl: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", difficulty: Difficulty.EASY },
        { title: "Move All Zeros to the End", slug: "move-zeroes", solveUrl: "https://leetcode.com/problems/move-zeroes/", difficulty: Difficulty.EASY },
        { title: "Sort Colors (Dutch National Flag)", slug: "sort-colors", solveUrl: "https://leetcode.com/problems/sort-colors/", difficulty: Difficulty.MEDIUM }
      ]
    },
    {
      number: 2,
      name: "Sliding Window Pattern",
      slug: "sliding-window-pattern",
      shortDescription: "Process contiguous subarrays of fixed or dynamic size efficiently.",
      whatIsThis: "Sliding Window maintains a window over a contiguous subarray and moves the right end to expand and left end to shrink, avoiding recomputation of overlapping elements.",
      intuition: "Instead of recalculating the sum or state of every subarray of length k from scratch, add the incoming right element and subtract the outgoing left element.",
      coreIdea: "Expand the window by incrementing right pointer. When window condition becomes invalid or exceeds bounds, shrink window from left.",
      interviewRule: "'Contiguous subarray' + a size/sum condition → sliding window, not nested loops.",
      difficulty: Difficulty.MEDIUM,
      importance: 5,
      timeComplexity: "O(N)",
      spaceComplexity: "O(1) (O(k) if using deque for min/max window)",
      status: ContentStatus.PUBLISHED,
      pseudocode: `int left = 0, windowSum = 0, best = 0;

for (int right = 0; right < n; right++) {
    windowSum += arr[right];       // expand window

    while (windowInvalid(windowSum)) {
        windowSum -= arr[left];    // shrink window
        left++;
    }
    best = max(best, right - left + 1);
}`,
      cppTemplate: `int left = 0, windowSum = 0, best = 0;
for (int right = 0; right < arr.size(); right++) {
    windowSum += arr[right];
    while (windowSum > target) {
        windowSum -= arr[left++];
    }
    best = max(best, right - left + 1);
}`,
      javaTemplate: `int left = 0, windowSum = 0, best = 0;
for (int right = 0; right < arr.length; right++) {
    windowSum += arr[right];
    while (windowSum > target) {
        windowSum -= arr[left++];
    }
    best = Math.max(best, right - left + 1);
}`,
      jsTemplate: `let left = 0, windowSum = 0, best = 0;
for (let right = 0; right < arr.length; right++) {
    windowSum += arr[right];
    while (windowSum > target) {
        windowSum -= arr[left++];
    }
    best = Math.max(best, right - left + 1);
}`,
      useCases: [
        { content: "Contiguous subarray with a size or sum condition", order: 0, isWhenNotToUse: false },
        { content: "'Maximum/minimum/longest/smallest subarray' phrasing", order: 1, isWhenNotToUse: false },
        { content: "Avoiding recomputation of overlapping subarrays", order: 2, isWhenNotToUse: false }
      ],
      problems: [
        { title: "Maximum Sum Subarray of Size K", slug: "maximum-sum-subarray-of-size-k", solveUrl: "https://www.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1", difficulty: Difficulty.EASY },
        { title: "Minimum Size Subarray Sum", slug: "minimum-size-subarray-sum", solveUrl: "https://leetcode.com/problems/minimum-size-subarray-sum/", difficulty: Difficulty.MEDIUM },
        { title: "Longest Subarray with Sum K", slug: "longest-subarray-with-sum-k", solveUrl: "https://www.geeksforgeeks.org/problems/longest-sub-array-with-sum-k3809/1", difficulty: Difficulty.MEDIUM },
        { title: "Sliding Window Maximum", slug: "sliding-window-maximum", solveUrl: "https://leetcode.com/problems/sliding-window-maximum/", difficulty: Difficulty.HARD }
      ]
    },
    {
      number: 3,
      name: "Prefix Sum / Cumulative Sum Pattern",
      slug: "prefix-sum-pattern",
      shortDescription: "Precompute running sums to perform range queries in O(1) time.",
      whatIsThis: "Prefix Sum precomputes an auxiliary array where prefix[i] stores the sum of elements from index 0 to i-1. Subarray sum between [L, R] can be computed as prefix[R+1] - prefix[L] in O(1).",
      intuition: "Transform repeated range sum queries from O(N) per query to O(1) by paying an initial O(N) precomputation cost.",
      coreIdea: "Build prefix[i+1] = prefix[i] + arr[i]. Combined with hash maps (seen[prefixSum]), it allows finding subarrays with target sum k in O(N).",
      interviewRule: "Repeated 'sum of range [l, r]' queries → precompute prefix sums once.",
      difficulty: Difficulty.MEDIUM,
      importance: 4,
      timeComplexity: "O(N) build, O(1) per query",
      spaceComplexity: "O(N)",
      status: ContentStatus.PUBLISHED,
      pseudocode: `int prefix[n+1] = {0};
for (int i = 0; i < n; i++)
    prefix[i+1] = prefix[i] + arr[i];

// sum of arr[l..r] inclusive:
int rangeSum = prefix[r+1] - prefix[l];

// subarray with sum = k (using hashmap of prefix sums):
unordered_map<int,int> seen; seen[0] = 1;
int sum = 0, count = 0;
for (int x : arr) {
    sum += x;
    count += seen[sum - k];   // # of subarrays ending here with sum k
    seen[sum]++;
}`,
      cppTemplate: `vector<int> prefix(n + 1, 0);
for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + arr[i];
int rangeSum = prefix[r + 1] - prefix[l];`,
      javaTemplate: `int[] prefix = new int[n + 1];
for (int i = 0; i < n; i++) prefix[i + 1] = prefix[i] + arr[i];
int rangeSum = prefix[r + 1] - prefix[l];`,
      jsTemplate: `const prefix = new Array(n + 1).fill(0);
for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + arr[i];
const rangeSum = prefix[r + 1] - prefix[l];`,
      useCases: [
        { content: "Repeated range-sum queries", order: 0, isWhenNotToUse: false },
        { content: "Need sum of any subarray fast", order: 1, isWhenNotToUse: false },
        { content: "Balance/equilibrium point problems", order: 2, isWhenNotToUse: false }
      ],
      problems: [
        { title: "Find Pivot Index (Equilibrium Index)", slug: "find-pivot-index", solveUrl: "https://leetcode.com/problems/find-pivot-index/", difficulty: Difficulty.EASY },
        { title: "Subarray Sum Equals K", slug: "subarray-sum-equals-k", solveUrl: "https://leetcode.com/problems/subarray-sum-equals-k/", difficulty: Difficulty.MEDIUM },
        { title: "Range Sum Query - Immutable", slug: "range-sum-query-immutable", solveUrl: "https://leetcode.com/problems/range-sum-query-immutable/", difficulty: Difficulty.EASY }
      ]
    },
    {
      number: 4,
      name: "Kadane's Algorithm Family",
      slug: "kadanes-algorithm-pattern",
      shortDescription: "Find maximum/minimum contiguous subarray sum or product in O(N).",
      whatIsThis: "Kadane's Algorithm calculates the maximum sum subarray ending at each index by deciding whether to extend the previous subarray or start a new subarray at current element.",
      intuition: "If running sum becomes negative, it will only reduce the sum of any future subarray, so reset running sum to current element.",
      coreIdea: "maxEndingHere = max(arr[i], maxEndingHere + arr[i]); maxSoFar = max(maxSoFar, maxEndingHere). For product variant, track both running max and running min.",
      interviewRule: "'Maximum/minimum sum or product subarray' → Kadane's; for product, always track running min too.",
      difficulty: Difficulty.MEDIUM,
      importance: 5,
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      status: ContentStatus.PUBLISHED,
      pseudocode: `int maxSoFar = arr[0], maxEndingHere = arr[0];

for (int i = 1; i < n; i++) {
    maxEndingHere = max(arr[i], maxEndingHere + arr[i]);
    maxSoFar = max(maxSoFar, maxEndingHere);
}
return maxSoFar;

// Product variant: track BOTH running max and min
// (a negative number can flip min into the new max)
maxEnd = min(nextMax = max(arr[i], maxEnd*arr[i], minEnd*arr[i]));`,
      cppTemplate: `int maxSoFar = arr[0], currMax = arr[0];
for (size_t i = 1; i < arr.size(); i++) {
    currMax = max(arr[i], currMax + arr[i]);
    maxSoFar = max(maxSoFar, currMax);
}
return maxSoFar;`,
      javaTemplate: `int maxSoFar = arr[0], currMax = arr[0];
for (int i = 1; i < arr.length; i++) {
    currMax = Math.max(arr[i], currMax + arr[i]);
    maxSoFar = Math.max(maxSoFar, currMax);
}
return maxSoFar;`,
      jsTemplate: `let maxSoFar = arr[0], currMax = arr[0];
for (let i = 1; i < arr.length; i++) {
    currMax = Math.max(arr[i], currMax + arr[i]);
    maxSoFar = Math.max(maxSoFar, currMax);
}
return maxSoFar;`,
      useCases: [
        { content: "Maximum/minimum contiguous subarray value", order: 0, isWhenNotToUse: false },
        { content: "Running max/min needs to reset when it goes negative/unhelpful", order: 1, isWhenNotToUse: false }
      ],
      problems: [
        { title: "Maximum Subarray Sum (Kadane's)", slug: "maximum-subarray", solveUrl: "https://leetcode.com/problems/maximum-subarray/", difficulty: Difficulty.MEDIUM },
        { title: "Maximum Circular Subarray Sum", slug: "maximum-sum-circular-subarray", solveUrl: "https://leetcode.com/problems/maximum-sum-circular-subarray/", difficulty: Difficulty.MEDIUM },
        { title: "Maximum Product Subarray", slug: "maximum-product-subarray", solveUrl: "https://leetcode.com/problems/maximum-product-subarray/", difficulty: Difficulty.MEDIUM }
      ]
    },
    {
      number: 5,
      name: "Sorting-Based Pattern",
      slug: "sorting-based-pattern",
      shortDescription: "Simplify problem state by sorting or using mathematical & voting techniques.",
      whatIsThis: "Sorting brings elements into order so duplicate, missing, or extreme values are adjacent or easy to locate, often collapsing complex problems into simple linear sweeps.",
      intuition: "If order doesn't matter initially, sorting O(N log N) reveals order property, or optimal voting tricks (Boyer-Moore) find majority elements in O(N) O(1).",
      coreIdea: "Sort array first OR use frequency / math formulas (e.g. sum = n(n+1)/2, XOR cancellation, Boyer-Moore voting).",
      interviewRule: "If sorting/counting collapses the problem to a single pass → don't overthink it, use math/voting tricks over brute force.",
      difficulty: Difficulty.EASY,
      importance: 4,
      timeComplexity: "O(N) or O(N log N)",
      spaceComplexity: "O(1)",
      status: ContentStatus.PUBLISHED,
      pseudocode: `// Missing number via sum formula
int expectedSum = n * (n + 1) / 2;
int actualSum = accumulate(arr);
int missing = expectedSum - actualSum;

// Boyer-Moore majority voting
int count = 0, candidate = -1;
for (int x : arr) {
    if (count == 0) candidate = x;
    count += (x == candidate) ? 1 : -1;
}
// candidate is the majority element (verify with a second pass)`,
      cppTemplate: `int count = 0, candidate = 0;
for (int x : arr) {
    if (count == 0) candidate = x;
    count += (x == candidate) ? 1 : -1;
}
return candidate;`,
      javaTemplate: `int count = 0, candidate = 0;
for (int x : arr) {
    if (count == 0) candidate = x;
    count += (x == candidate) ? 1 : -1;
}
return candidate;`,
      jsTemplate: `let count = 0, candidate = 0;
for (let x of arr) {
    if (count === 0) candidate = x;
    count += (x === candidate) ? 1 : -1;
}
return candidate;`,
      useCases: [
        { content: "Answer becomes obvious once array is sorted or elements are counted", order: 0, isWhenNotToUse: false },
        { content: "Finding missing/duplicate/majority/kth element", order: 1, isWhenNotToUse: false }
      ],
      problems: [
        { title: "Missing Number", slug: "missing-number", solveUrl: "https://leetcode.com/problems/missing-number/", difficulty: Difficulty.EASY },
        { title: "Find the Duplicate Number", slug: "find-the-duplicate-number", solveUrl: "https://leetcode.com/problems/find-the-duplicate-number/", difficulty: Difficulty.MEDIUM },
        { title: "Majority Element (Boyer-Moore)", slug: "majority-element", solveUrl: "https://leetcode.com/problems/majority-element/", difficulty: Difficulty.EASY },
        { title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", solveUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty: Difficulty.MEDIUM }
      ]
    },
    {
      number: 6,
      name: "Rotation Pattern",
      slug: "rotation-pattern",
      shortDescription: "Rotate arrays or detect cyclic shifts using the three-step reversal algorithm.",
      whatIsThis: "Rotation shifts elements left or right by K positions. The Reversal Algorithm achieves O(N) time and O(1) space by reversing three segments of the array.",
      intuition: "Reversing the entire array flips the relative blocks. Reversing the sub-blocks individually restores original order within each block.",
      coreIdea: "To rotate right by k: reverse(0, n-1), reverse(0, k-1), reverse(k, n-1).",
      interviewRule: "'Rotate by k' → reversal trick (reverse all, then reverse the two parts) is the O(1)-space answer interviewers want.",
      difficulty: Difficulty.EASY,
      importance: 4,
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      status: ContentStatus.PUBLISHED,
      pseudocode: `// Reversal algorithm - rotate right by k (O(1) space)
void reverse(int arr[], int start, int end) {
    while (start < end) swap(arr[start++], arr[end--]);
}

k = k % n;
reverse(arr, 0, n - 1);        // reverse whole array
reverse(arr, 0, k - 1);        // reverse first k elements
reverse(arr, k, n - 1);        // reverse remaining elements`,
      cppTemplate: `k %= n;
reverse(arr.begin(), arr.end());
reverse(arr.begin(), arr.begin() + k);
reverse(arr.begin() + k, arr.end());`,
      javaTemplate: `k %= n;
reverse(arr, 0, n - 1);
reverse(arr, 0, k - 1);
reverse(arr, k, n - 1);`,
      jsTemplate: `k %= n;
reverse(arr, 0, n - 1);
reverse(arr, 0, k - 1);
reverse(arr, k, n - 1);`,
      useCases: [
        { content: "Shift array elements left/right by k without extra array", order: 0, isWhenNotToUse: false },
        { content: "Checking cyclic relationships between arrays", order: 1, isWhenNotToUse: false }
      ],
      problems: [
        { title: "Rotate Array by K Positions", slug: "rotate-array", solveUrl: "https://leetcode.com/problems/rotate-array/", difficulty: Difficulty.MEDIUM },
        { title: "Check if Array Is Sorted and Rotated", slug: "check-if-array-is-sorted-and-rotated", solveUrl: "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/", difficulty: Difficulty.EASY }
      ]
    },
    {
      number: 7,
      name: "Matrix (2D Array) Pattern",
      slug: "matrix-2d-array-pattern",
      shortDescription: "Navigate, rotate, transpose, and search 2D matrices in-place.",
      whatIsThis: "Matrix patterns cover transformations (transpose + reverse row = 90° rotation), spiral traversal, and boundary elimination searching in row/col sorted matrices.",
      intuition: "In sorted 2D grid, start from top-right corner: if element > target, move left (eliminate col); if element < target, move down (eliminate row).",
      coreIdea: "Transpose matrix (mat[i][j] <-> mat[j][i]) then reverse rows for 90° clockwise rotation. Start from top-right corner for O(M+N) search.",
      interviewRule: "Rotate = transpose + reverse; sorted matrix search = start from a corner, eliminate a row or column each step.",
      difficulty: Difficulty.MEDIUM,
      importance: 5,
      timeComplexity: "O(N²) traversal / O(M+N) search",
      spaceComplexity: "O(1)",
      status: ContentStatus.PUBLISHED,
      pseudocode: `// Rotate 90° clockwise in place = Transpose + Reverse each row
for (int i = 0; i < n; i++)
    for (int j = i+1; j < n; j++)
        swap(mat[i][j], mat[j][i]);      // transpose

for (int i = 0; i < n; i++)
    reverse(mat[i]);                     // reverse each row

// Search in sorted matrix - start top-right corner
int r = 0, c = cols - 1;
while (r < rows && c >= 0) {
    if (mat[r][c] == target) return true;
    else if (mat[r][c] > target) c--;
    else r++;
}`,
      cppTemplate: `int r = 0, c = cols - 1;
while (r < rows && c >= 0) {
    if (mat[r][c] == target) return true;
    if (mat[r][c] > target) c--;
    else r++;
}
return false;`,
      javaTemplate: `int r = 0, c = cols - 1;
while (r < rows && c >= 0) {
    if (mat[r][c] == target) return true;
    if (mat[r][c] > target) c--;
    else r++;
}
return false;`,
      jsTemplate: `let r = 0, c = cols - 1;
while (r < rows && c >= 0) {
    if (mat[r][c] === target) return true;
    if (mat[r][c] > target) c--;
    else r++;
}
return false;`,
      useCases: [
        { content: "Problem operates on rows/columns/diagonals of a grid", order: 0, isWhenNotToUse: false },
        { content: "In-place transformation of a matrix", order: 1, isWhenNotToUse: false },
        { content: "Traversal order matters (spiral, diagonal, boundary)", order: 2, isWhenNotToUse: false }
      ],
      problems: [
        { title: "Rotate Image (90 Degrees Clockwise)", slug: "rotate-image", solveUrl: "https://leetcode.com/problems/rotate-image/", difficulty: Difficulty.MEDIUM },
        { title: "Spiral Matrix Traversal", slug: "spiral-matrix", solveUrl: "https://leetcode.com/problems/spiral-matrix/", difficulty: Difficulty.MEDIUM },
        { title: "Search a 2D Matrix II", slug: "search-a-2d-matrix-ii", solveUrl: "https://leetcode.com/problems/search-a-2d-matrix-ii/", difficulty: Difficulty.MEDIUM }
      ]
    },
    {
      number: 8,
      name: "Frequency / Hashing Pattern",
      slug: "frequency-hashing-pattern",
      shortDescription: "Count frequencies and check element existence in O(1) time using Hash Maps/Sets.",
      whatIsThis: "Frequency & Hashing pattern trades O(N) auxiliary space for instant O(1) lookup to count frequencies, test set membership, or pair target differences.",
      intuition: "Instead of scanning the array repeatedly (O(N²)), store elements or frequencies in a hash map or hash set during a single pass.",
      coreIdea: "Use unordered_map<int, int> or unordered_set<int> to store seen elements, frequencies, or complement values.",
      interviewRule: "'Count / existence / frequency' anywhere in the question → reach for a hashmap before sorting.",
      difficulty: Difficulty.EASY,
      importance: 5,
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
      status: ContentStatus.PUBLISHED,
      pseudocode: `unordered_map<int,int> freq;
for (int x : arr) freq[x]++;

// first non-repeating element
for (int x : arr) {
    if (freq[x] == 1) return x;
}

// pairs with given difference d
unordered_set<int> seen(arr.begin(), arr.end());
for (int x : arr) {
    if (seen.count(x + d)) // found pair (x, x+d)
}`,
      cppTemplate: `unordered_map<int, int> freq;
for (int x : arr) freq[x]++;
for (int x : arr) if (freq[x] == 1) return x;
return -1;`,
      javaTemplate: `Map<Integer, Integer> freq = new HashMap<>();
for (int x : arr) freq.put(x, freq.getOrDefault(x, 0) + 1);
for (int x : arr) if (freq.get(x) == 1) return x;
return -1;`,
      jsTemplate: `const freq = new Map();
for (let x of arr) freq.set(x, (freq.get(x) || 0) + 1);
for (let x of arr) if (freq.get(x) === 1) return x;
return -1;`,
      useCases: [
        { content: "Need to count occurrences or check existence in O(1) lookup", order: 0, isWhenNotToUse: false },
        { content: "Comparing elements/frequencies between two arrays", order: 1, isWhenNotToUse: false },
        { content: "Finding first/unique/paired elements without sorting", order: 2, isWhenNotToUse: false }
      ],
      problems: [
        { title: "First Unique Character / Non-Repeating Element", slug: "first-unique-character-in-a-string", solveUrl: "https://leetcode.com/problems/first-unique-character-in-a-string/", difficulty: Difficulty.EASY },
        { title: "Find All Pairs with Given Difference", slug: "k-diff-pairs-in-an-array", solveUrl: "https://leetcode.com/problems/k-diff-pairs-in-an-array/", difficulty: Difficulty.MEDIUM },
        { title: "Check if Two Arrays are Equal / Anagrams", slug: "valid-anagram", solveUrl: "https://leetcode.com/problems/valid-anagram/", difficulty: Difficulty.EASY }
      ]
    },
    {
      number: 9,
      name: "Merging / Intervals Pattern",
      slug: "merging-intervals-pattern",
      shortDescription: "Sort and sweep ranges to merge overlapping intervals or sorted arrays.",
      whatIsThis: "The Merging/Intervals pattern orders intervals by start time, allowing a single linear sweep to detect overlaps and merge contiguous ranges.",
      intuition: "Sorting by start time guarantees that any overlapping interval must lie adjacent to or intersect with the current active interval.",
      coreIdea: "Sort intervals by start time. Maintain a list of merged intervals; if current.start <= lastMerged.end, merge by updating lastMerged.end = max(lastMerged.end, current.end).",
      interviewRule: "'Overlapping / merge' → sort by start first, then sweep once comparing to the last merged item.",
      difficulty: Difficulty.MEDIUM,
      importance: 5,
      timeComplexity: "O(N log N) (sorting dominates)",
      spaceComplexity: "O(N)",
      status: ContentStatus.PUBLISHED,
      pseudocode: `// Merge intervals
sort(intervals.begin(), intervals.end());   // by start time
vector<Interval> result;
result.push_back(intervals[0]);

for (int i = 1; i < intervals.size(); i++) {
    Interval& last = result.back();
    if (intervals[i].start <= last.end) {
        last.end = max(last.end, intervals[i].end);  // merge
    } else {
        result.push_back(intervals[i]);
    }
}`,
      cppTemplate: `sort(intervals.begin(), intervals.end());
vector<vector<int>> merged;
for (auto& interval : intervals) {
    if (merged.empty() || merged.back()[1] < interval[0]) {
        merged.push_back(interval);
    } else {
        merged.back()[1] = max(merged.back()[1], interval[1]);
    }
}
return merged;`,
      javaTemplate: `Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
List<int[]> merged = new ArrayList<>();
for (int[] interval : intervals) {
    if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) {
        merged.add(interval);
    } else {
        merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], interval[1]);
    }
}
return merged.toArray(new int[merged.size()][]);`,
      jsTemplate: `intervals.sort((a, b) => a[0] - b[0]);
const merged = [];
for (let interval of intervals) {
    if (!merged.length || merged[merged.length - 1][1] < interval[0]) {
        merged.push(interval);
    } else {
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], interval[1]);
    }
}
return merged;`,
      useCases: [
        { content: "Two sorted arrays/lists need to become one", order: 0, isWhenNotToUse: false },
        { content: "Ranges/intervals overlap and need to be combined", order: 1, isWhenNotToUse: false }
      ],
      problems: [
        { title: "Merge Overlapping Intervals", slug: "merge-intervals", solveUrl: "https://leetcode.com/problems/merge-intervals/", difficulty: Difficulty.MEDIUM },
        { title: "Merge Sorted Array Without Extra Space", slug: "merge-sorted-array", solveUrl: "https://leetcode.com/problems/merge-sorted-array/", difficulty: Difficulty.EASY },
        { title: "Insert Interval", slug: "insert-interval", solveUrl: "https://leetcode.com/problems/insert-interval/", difficulty: Difficulty.MEDIUM }
      ]
    }
  ];

  for (const pData of arrayPatternsData) {
    // Upsert pattern
    const pattern = await prisma.pattern.upsert({
      where: { slug: pData.slug },
      update: {
        number: pData.number,
        name: pData.name,
        shortDescription: pData.shortDescription,
        whatIsThis: pData.whatIsThis,
        intuition: pData.intuition,
        coreIdea: pData.coreIdea,
        interviewRule: pData.interviewRule,
        difficulty: pData.difficulty,
        importance: pData.importance,
        timeComplexity: pData.timeComplexity,
        spaceComplexity: pData.spaceComplexity,
        pseudocode: pData.pseudocode,
        cppTemplate: pData.cppTemplate,
        javaTemplate: pData.javaTemplate,
        jsTemplate: pData.jsTemplate,
        status: pData.status,
        topicId: topic.id,
        order: pData.number,
      },
      create: {
        number: pData.number,
        name: pData.name,
        slug: pData.slug,
        shortDescription: pData.shortDescription,
        whatIsThis: pData.whatIsThis,
        intuition: pData.intuition,
        coreIdea: pData.coreIdea,
        interviewRule: pData.interviewRule,
        difficulty: pData.difficulty,
        importance: pData.importance,
        timeComplexity: pData.timeComplexity,
        spaceComplexity: pData.spaceComplexity,
        pseudocode: pData.pseudocode,
        cppTemplate: pData.cppTemplate,
        javaTemplate: pData.javaTemplate,
        jsTemplate: pData.jsTemplate,
        status: pData.status,
        topicId: topic.id,
        order: pData.number,
      },
    });

    console.log(`Upserted Pattern ${pData.number}: ${pData.name}`);

    // Re-create use cases for pattern
    await prisma.patternUseCase.deleteMany({ where: { patternId: pattern.id } });
    for (const uc of pData.useCases) {
      await prisma.patternUseCase.create({
        data: {
          patternId: pattern.id,
          content: uc.content,
          order: uc.order,
          isWhenNotToUse: uc.isWhenNotToUse,
        },
      });
    }

    // Upsert problems and link to pattern
    let probOrder = 0;
    for (const probData of pData.problems) {
      const problem = await prisma.problem.upsert({
        where: { slug: probData.slug },
        update: {
          title: probData.title,
          solveUrl: probData.solveUrl,
          difficulty: probData.difficulty,
        },
        create: {
          title: probData.title,
          slug: probData.slug,
          platform: probData.solveUrl.includes("leetcode") ? "LeetCode" : "GeeksforGeeks",
          solveUrl: probData.solveUrl,
          difficulty: probData.difficulty,
        },
      });

      await prisma.patternProblem.upsert({
        where: { patternId_problemId: { patternId: pattern.id, problemId: problem.id } },
        update: { order: probOrder },
        create: { patternId: pattern.id, problemId: problem.id, isCore: true, order: probOrder },
      });
      probOrder++;
    }
  }

  console.log("Successfully seeded all 9 Array Patterns, Use Cases, Code Templates, and Problems!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
