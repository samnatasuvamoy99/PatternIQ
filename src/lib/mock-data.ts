// ============================================================
// PATTERNIQ DEMO DATA & FALLBACKS
// ============================================================

export interface TopicData {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  patternCount: number;
  completedCount?: number;
}

export interface PatternData {
  id: string;
  number: number;
  name: string;
  slug: string;
  topicSlug: string;
  topicName: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  importance: number;
  summary: string;
  intuition: string;
  identificationRules: string[];
  approachSteps: string[];
  complexity: {
    time: string;
    space: string;
  };
  pseudocode: string;
  codeTemplates: {
    cpp: string;
    java: string;
    python: string;
    javascript: string;
  };
  problems: ProblemData[];
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "MASTERED";
}

export interface ProblemData {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  platform: string;
  solveUrl: string;
  orderIndex: number;
  status?: "NOT_ATTEMPTED" | "ATTEMPTED" | "SOLVED";
}

export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  likesCount: number;
  commentsCount: number;
  readTime: string;
  publishedAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export const MOCK_TOPICS: TopicData[] = [
  {
    id: "top-1",
    name: "Two Pointers",
    slug: "two-pointers",
    description: "Techniques involving two pointers iterating across linear structures to optimize time and space complexity.",
    icon: "Target",
    order: 1,
    patternCount: 6,
    completedCount: 4,
  },
  {
    id: "top-2",
    name: "Sliding Window",
    slug: "sliding-window",
    description: "Dynamic and fixed size windows across arrays or strings to solve subarray problems in O(N).",
    icon: "Maximize2",
    order: 2,
    patternCount: 5,
    completedCount: 3,
  },
  {
    id: "top-3",
    name: "Fast & Slow Pointers",
    slug: "fast-slow-pointers",
    description: "Floyd's Cycle detection method for linked lists, cyclic arrays, and number transformations.",
    icon: "Zap",
    order: 3,
    patternCount: 4,
    completedCount: 2,
  },
  {
    id: "top-4",
    name: "Binary Search",
    slug: "binary-search",
    description: "Logarithmic search on sorted arrays, search spaces, and answer ranges with boundary conditions.",
    icon: "Search",
    order: 4,
    patternCount: 7,
    completedCount: 5,
  },
  {
    id: "top-5",
    name: "Tree BFS & DFS",
    slug: "tree-bfs-dfs",
    description: "Level order traversals, recursion, pathfinding, and ancestor properties in binary trees.",
    icon: "GitBranch",
    order: 5,
    patternCount: 8,
    completedCount: 4,
  },
  {
    id: "top-6",
    name: "Dynamic Programming",
    slug: "dynamic-programming",
    description: "0/1 Knapsack, Longest Common Subsequence, Matrix chain, and state-machine DP patterns.",
    icon: "Layers",
    order: 6,
    patternCount: 12,
    completedCount: 6,
  },
];

export const MOCK_PATTERNS: PatternData[] = [
  {
    id: "pat-1",
    number: 1,
    name: "Two Pointers: Converging from Opposite Ends",
    slug: "two-pointers-converging",
    topicSlug: "two-pointers",
    topicName: "Two Pointers",
    difficulty: "EASY",
    importance: 5,
    summary: "Initialize pointers at both ends of a sorted array and move inwards based on condition.",
    intuition: "When an array is sorted, comparing elements at the lowest and highest boundaries gives us deterministic direction: increasing the left pointer increases sum, decreasing right pointer decreases sum.",
    identificationRules: [
      "Input is a sorted array or list (or can be sorted in O(N log N)).",
      "Looking for a pair or triplet matching a target sum or constraint.",
      "Eliminating the need for nested O(N^2) loops."
    ],
    approachSteps: [
      "Set `left = 0` and `right = n - 1`.",
      "Compute `currentSum = arr[left] + arr[right]`.",
      "If `currentSum == target`, record the pair.",
      "If `currentSum < target`, increment `left` to increase the sum.",
      "If `currentSum > target`, decrement `right` to decrease the sum."
    ],
    complexity: {
      time: "O(N)",
      space: "O(1)"
    },
    pseudocode: `function twoSumSorted(arr, target):
    left = 0
    right = arr.length - 1
    
    while left < right:
        currentSum = arr[left] + arr[right]
        if currentSum == target:
            return [left, right]
        else if currentSum < target:
            left++
        else:
            right--
            
    return [-1, -1]`,
    codeTemplates: {
      cpp: `vector<int> twoSumSorted(vector<int>& numbers, int target) {
    int left = 0, right = numbers.size() - 1;
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) return {left + 1, right + 1};
        else if (sum < target) left++;
        else right--;
    }
    return {-1, -1};
}`,
      java: `public int[] twoSumSorted(int[] numbers, int target) {
    int left = 0, right = numbers.length - 1;
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) return new int[]{left + 1, right + 1};
        else if (sum < target) left++;
        else right--;
    }
    return new int[]{-1, -1};
}`,
      python: `def twoSumSorted(numbers: list[int], target: int) -> list[int]:
    left, right = 0, len(numbers) - 1
    while left < right:
        current_sum = numbers[left] + numbers[right]
        if current_sum == target:
            return [left + 1, right + 1]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return [-1, -1]`,
      javascript: `function twoSumSorted(numbers, target) {
    let left = 0, right = numbers.length - 1;
    while (left < right) {
        const sum = numbers[left] + numbers[right];
        if (sum === target) return [left + 1, right + 1];
        if (sum < target) left++;
        else right--;
    }
    return [-1, -1];
}`
    },
    problems: [
      {
        id: "prob-1",
        title: "Two Sum II - Input Array Is Sorted",
        slug: "two-sum-ii-input-array-is-sorted",
        difficulty: "MEDIUM",
        platform: "LeetCode #167",
        solveUrl: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
        orderIndex: 1,
        status: "SOLVED"
      },
      {
        id: "prob-2",
        title: "3Sum",
        slug: "3sum",
        difficulty: "MEDIUM",
        platform: "LeetCode #15",
        solveUrl: "https://leetcode.com/problems/3sum/",
        orderIndex: 2,
        status: "SOLVED"
      },
      {
        id: "prob-3",
        title: "Container With Most Water",
        slug: "container-with-most-water",
        difficulty: "MEDIUM",
        platform: "LeetCode #11",
        solveUrl: "https://leetcode.com/problems/container-with-most-water/",
        orderIndex: 3,
        status: "ATTEMPTED"
      }
    ],
    status: "MASTERED"
  },
  {
    id: "pat-2",
    number: 2,
    name: "Sliding Window: Dynamic Size with Constraint",
    slug: "sliding-window-dynamic",
    topicSlug: "sliding-window",
    topicName: "Sliding Window",
    difficulty: "MEDIUM",
    importance: 5,
    summary: "Expand right pointer to satisfy constraint, then contract left pointer to minimize/maximize window.",
    intuition: "Instead of re-computing every possible contiguous subarray, we expand a window until a target condition is met or violated, and shrink from the left to explore the optimal subsegment.",
    identificationRules: [
      "Contiguous subarray or substring problem.",
      "Finding shortest/longest window with a specific condition (e.g. at most K distinct elements).",
      "Linear time O(N) requirement."
    ],
    approachSteps: [
      "Initialize `left = 0`, `windowState` (hash map or frequency counter).",
      "Loop `right` from `0` to `n - 1`.",
      "Add `arr[right]` to `windowState`.",
      "While `windowState` violates constraint, remove `arr[left]` and increment `left`.",
      "Update answer with `right - left + 1`."
    ],
    complexity: {
      time: "O(N)",
      space: "O(K) where K is unique character set"
    },
    pseudocode: `function minSubArrayLen(target, nums):
    left = 0
    currentSum = 0
    minLen = INFINITY
    
    for right from 0 to nums.length - 1:
        currentSum += nums[right]
        while currentSum >= target:
            minLen = min(minLen, right - left + 1)
            currentSum -= nums[left]
            left++
            
    return minLen == INFINITY ? 0 : minLen`,
    codeTemplates: {
      cpp: `int minSubArrayLen(int target, vector<int>& nums) {
    int left = 0, currentSum = 0, minLen = INT_MAX;
    for (int right = 0; right < nums.size(); right++) {
        currentSum += nums[right];
        while (currentSum >= target) {
            minLen = min(minLen, right - left + 1);
            currentSum -= nums[left++];
        }
    }
    return minLen == INT_MAX ? 0 : minLen;
}`,
      java: `public int minSubArrayLen(int target, int[] nums) {
    int left = 0, currentSum = 0, minLen = Integer.MAX_VALUE;
    for (int right = 0; right < nums.length; right++) {
        currentSum += nums[right];
        while (currentSum >= target) {
            minLen = Math.min(minLen, right - left + 1);
            currentSum -= nums[left++];
        }
    }
    return minLen == Integer.MAX_VALUE ? 0 : minLen;
}`,
      python: `def minSubArrayLen(target: int, nums: list[int]) -> int:
    left = 0
    current_sum = 0
    min_len = float('inf')
    for right in range(len(nums)):
        current_sum += nums[right]
        while current_sum >= target:
            min_len = min(min_len, right - left + 1)
            current_sum -= nums[left]
            left += 1
    return 0 if min_len == float('inf') else min_len`,
      javascript: `function minSubArrayLen(target, nums) {
    let left = 0, currentSum = 0, minLen = Infinity;
    for (let right = 0; right < nums.length; right++) {
        currentSum += nums[right];
        while (currentSum >= target) {
            minLen = Math.min(minLen, right - left + 1);
            currentSum -= nums[left++];
        }
    }
    return minLen === Infinity ? 0 : minLen;
}`
    },
    problems: [
      {
        id: "prob-4",
        title: "Minimum Size Subarray Sum",
        slug: "minimum-size-subarray-sum",
        difficulty: "MEDIUM",
        platform: "LeetCode #209",
        solveUrl: "https://leetcode.com/problems/minimum-size-subarray-sum/",
        orderIndex: 1,
        status: "SOLVED"
      },
      {
        id: "prob-5",
        title: "Longest Substring Without Repeating Characters",
        slug: "longest-substring-without-repeating-characters",
        difficulty: "MEDIUM",
        platform: "LeetCode #3",
        solveUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        orderIndex: 2,
        status: "SOLVED"
      }
    ],
    status: "IN_PROGRESS"
  }
];

export const MOCK_REVISIONS = [
  {
    id: "rev-1",
    patternId: "pat-1",
    patternName: "Two Pointers: Converging from Opposite Ends",
    patternSlug: "two-pointers-converging",
    topicName: "Two Pointers",
    difficulty: "EASY",
    scheduledFor: "Today",
    repetitionCount: 3,
    intervalDays: 7,
    status: "PENDING"
  },
  {
    id: "rev-2",
    patternId: "pat-2",
    patternName: "Sliding Window: Dynamic Size with Constraint",
    patternSlug: "sliding-window-dynamic",
    topicName: "Sliding Window",
    difficulty: "MEDIUM",
    scheduledFor: "Today",
    repetitionCount: 1,
    intervalDays: 3,
    status: "PENDING"
  }
];

export const MOCK_ARTICLES: ArticleData[] = [
  {
    id: "art-1",
    title: "Mastering the 14 Patterns to Ace Any Technical Interview",
    slug: "mastering-14-patterns",
    excerpt: "A structured mental framework for recognizing underlying patterns in LeetCode problems instead of memorizing solutions.",
    content: `## Why Patterns Matter More Than Grinding 500 Problems

Most candidates make the mistake of solving random LeetCode problems without realizing that 90% of coding interview questions derive from approximately **14 canonical patterns**.

### 1. Two Pointers
When dealing with sorted arrays or searching pairs, Two Pointers cuts quadratic $O(N^2)$ checks down to clean linear $O(N)$ operations.

### 2. Sliding Window
Whenever the question asks for a **contiguous subarray or substring** satisfying a condition (e.g. max sum, distinct elements), suspect a Sliding Window immediately.

### 3. Fast & Slow Pointers
Ideal for detecting cycles in linked lists or mathematical sequences (Floyd's Tortoise and Hare algorithm).

Stay consistent, master the intuition, and watch your problem-solving speed multiply!`,
    category: "DSA",
    author: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    likesCount: 142,
    commentsCount: 18,
    readTime: "6 min read",
    publishedAt: "2 days ago",
    isLiked: false,
    isBookmarked: true
  },
  {
    id: "art-2",
    title: "Deep Dive into Dynamic Programming: From Memoization to Tabulation",
    slug: "deep-dive-dynamic-programming",
    excerpt: "Understand subproblem overlap, optimal substructure, and transform top-down recursion into optimal bottom-up DP.",
    content: `## The DP Framework

Dynamic programming is simply recursion with memoization or tabulation.

### The 4-Step Recipe:
1. **Define the State**: What variables define a distinct subproblem? (e.g. \`dp[i][w]\`)
2. **Find the Recurrence Relation**: How do you transition from subproblem to current problem?
3. **Identify Base Cases**: What are the smallest, trivial values?
4. **Determine Evaluation Order**: Top-down with cache or bottom-up loop?`,
    category: "DSA",
    author: {
      name: "Sophia Chen",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
    },
    likesCount: 98,
    commentsCount: 12,
    readTime: "8 min read",
    publishedAt: "4 days ago",
    isLiked: true,
    isBookmarked: false
  }
];
