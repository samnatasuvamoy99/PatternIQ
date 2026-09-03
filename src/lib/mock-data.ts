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
  },
  {
    id: "pat-3",
    number: 3,
    name: "Fast & Slow Pointers: Floyd's Cycle Detection",
    slug: "floyds-cycle-detection",
    topicSlug: "fast-slow-pointers",
    topicName: "Fast & Slow Pointers",
    difficulty: "EASY",
    importance: 5,
    summary: "Move two pointers at different speeds (1x and 2x) to detect loops or find midpoints in linear structures.",
    intuition: "If a loop exists, a pointer moving twice as fast will inevitably lap and meet the slow pointer within the cycle without needing extra memory.",
    identificationRules: [
      "Linked list or sequence problem where a loop/cycle might exist.",
      "Finding the middle node of a linked list in a single pass.",
      "Finding the start of a cycle in O(1) space."
    ],
    approachSteps: [
      "Initialize `slow = head` and `fast = head`.",
      "Iterate while `fast != null` and `fast.next != null`.",
      "Advance `slow = slow.next` and `fast = fast.next.next`.",
      "If `slow == fast`, a cycle is confirmed."
    ],
    complexity: {
      time: "O(N)",
      space: "O(1)"
    },
    pseudocode: `function hasCycle(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return true
    return false`,
    codeTemplates: {
      cpp: `bool hasCycle(ListNode *head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
      java: `public boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`,
      python: `def hasCycle(head: Optional[ListNode]) -> bool:
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
      javascript: `function hasCycle(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
    }
    return false;
}`
    },
    problems: [
      {
        id: "prob-6",
        title: "Linked List Cycle",
        slug: "linked-list-cycle",
        difficulty: "EASY",
        platform: "LeetCode #141",
        solveUrl: "https://leetcode.com/problems/linked-list-cycle/",
        orderIndex: 1,
        status: "SOLVED"
      },
      {
        id: "prob-7",
        title: "Middle of the Linked List",
        slug: "middle-of-the-linked-list",
        difficulty: "EASY",
        platform: "LeetCode #876",
        solveUrl: "https://leetcode.com/problems/middle-of-the-linked-list/",
        orderIndex: 2,
        status: "SOLVED"
      }
    ],
    status: "MASTERED"
  },
  {
    id: "pat-4",
    number: 4,
    name: "Binary Search: Search on Answer Range",
    slug: "binary-search-answer-range",
    topicSlug: "binary-search",
    topicName: "Binary Search",
    difficulty: "MEDIUM",
    importance: 5,
    summary: "Identify a monotonic predicate function f(x) and binary search across the min and max possible answers.",
    intuition: "When direct computation is hard but verifying whether an answer K is feasible is easy, search across the answer space [low, high] in logarithmic steps.",
    identificationRules: [
      "Problem asks to minimize the maximum or maximize the minimum.",
      "Feasibility function is monotonic: if K works, all values > K also work.",
      "Input size N is large, but search space is bounded."
    ],
    approachSteps: [
      "Determine range `[low, high]` of valid candidate answers.",
      "Define `isFeasible(mid)` returning boolean.",
      "Binary search `mid = low + (high - low) / 2`.",
      "Adjust boundaries based on `isFeasible` result."
    ],
    complexity: {
      time: "O(N log(Range))",
      space: "O(1)"
    },
    pseudocode: `function searchAnswer(nums, k):
    low = minPossible, high = maxPossible
    ans = high
    while low <= high:
        mid = low + (high - low) / 2
        if isFeasible(nums, mid, k):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    return ans`,
    codeTemplates: {
      cpp: `int shipWithinDays(vector<int>& weights, int days) {
    int low = *max_element(weights.begin(), weights.end());
    int high = accumulate(weights.begin(), weights.end(), 0);
    int ans = high;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (canShip(weights, days, mid)) {
            ans = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return ans;
}`,
      java: `public int shipWithinDays(int[] weights, int days) {
    int low = 0, high = 0;
    for (int w : weights) { low = Math.max(low, w); high += w; }
    int ans = high;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (canShip(weights, days, mid)) {
            ans = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return ans;
}`,
      python: `def shipWithinDays(weights: list[int], days: int) -> int:
    low, high = max(weights), sum(weights)
    ans = high
    while low <= high:
        mid = (low + high) // 2
        if canShip(weights, days, mid):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    return ans`,
      javascript: `function shipWithinDays(weights, days) {
    let low = Math.max(...weights);
    let high = weights.reduce((a, b) => a + b, 0);
    let ans = high;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (canShip(weights, days, mid)) {
            ans = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return ans;
}`
    },
    problems: [
      {
        id: "prob-8",
        title: "Capacity To Ship Packages Within D Days",
        slug: "capacity-to-ship-packages-within-d-days",
        difficulty: "MEDIUM",
        platform: "LeetCode #1011",
        solveUrl: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
        orderIndex: 1,
        status: "SOLVED"
      },
      {
        id: "prob-9",
        title: "Koko Eating Bananas",
        slug: "koko-eating-bananas",
        difficulty: "MEDIUM",
        platform: "LeetCode #875",
        solveUrl: "https://leetcode.com/problems/koko-eating-bananas/",
        orderIndex: 2,
        status: "ATTEMPTED"
      }
    ],
    status: "IN_PROGRESS"
  },
  {
    id: "pat-5",
    number: 5,
    name: "Tree BFS: Level Order Traversal",
    slug: "tree-level-order-traversal",
    topicSlug: "tree-bfs-dfs",
    topicName: "Tree BFS & DFS",
    difficulty: "EASY",
    importance: 5,
    summary: "Traverse tree nodes level by level using a queue FIFO data structure.",
    intuition: "Using a queue where the queue size is snapshot at each level allows processing all children of the current depth before moving to the next.",
    identificationRules: [
      "Level by level processing required (e.g. zigzag, right view, level averages).",
      "Finding shortest path in unweighted tree or graph.",
      "Connecting sibling nodes at the same tree depth."
    ],
    approachSteps: [
      "If `root == null`, return empty list.",
      "Initialize queue with `[root]`.",
      "While queue is not empty, record `levelSize = queue.size()`.",
      "Iterate `levelSize` times: pop node, add value, push left and right children."
    ],
    complexity: {
      time: "O(N)",
      space: "O(W) where W is max tree width"
    },
    pseudocode: `function levelOrder(root):
    if not root: return []
    queue = [root]
    result = []
    while queue:
        levelSize = len(queue)
        currentLevel = []
        for i from 0 to levelSize - 1:
            node = queue.pop(0)
            currentLevel.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(currentLevel)
    return result`,
    codeTemplates: {
      cpp: `vector<vector<int>> levelOrder(TreeNode* root) {
    if (!root) return {};
    vector<vector<int>> result;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int sz = q.size();
        vector<int> level;
        for (int i = 0; i < sz; i++) {
            TreeNode* curr = q.front(); q.pop();
            level.push_back(curr->val);
            if (curr->left) q.push(curr->left);
            if (curr->right) q.push(curr->right);
        }
        result.push_back(level);
    }
    return result;
}`,
      java: `public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            TreeNode curr = queue.poll();
            level.add(curr.val);
            if (curr.left != null) queue.offer(curr.left);
            if (curr.right != null) queue.offer(curr.right);
        }
        result.add(level);
    }
    return result;
}`,
      python: `def levelOrder(root: Optional[TreeNode]) -> list[list[int]]:
    if not root:
        return []
    result, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result`,
      javascript: `function levelOrder(root) {
    if (!root) return [];
    const result = [], queue = [root];
    while (queue.length) {
        const size = queue.length, level = [];
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(level);
    }
    return result;
}`
    },
    problems: [
      {
        id: "prob-10",
        title: "Binary Tree Level Order Traversal",
        slug: "binary-tree-level-order-traversal",
        difficulty: "MEDIUM",
        platform: "LeetCode #102",
        solveUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
        orderIndex: 1,
        status: "SOLVED"
      },
      {
        id: "prob-11",
        title: "Binary Tree Right Side View",
        slug: "binary-tree-right-side-view",
        difficulty: "MEDIUM",
        platform: "LeetCode #199",
        solveUrl: "https://leetcode.com/problems/binary-tree-right-side-view/",
        orderIndex: 2,
        status: "SOLVED"
      }
    ],
    status: "MASTERED"
  },
  {
    id: "pat-6",
    number: 6,
    name: "Dynamic Programming: 0/1 Knapsack Pattern",
    slug: "dp-01-knapsack",
    topicSlug: "dynamic-programming",
    topicName: "Dynamic Programming",
    difficulty: "MEDIUM",
    importance: 5,
    summary: "Given elements with weights and values, decide to include or exclude each element to optimize total value within capacity.",
    intuition: "At each element i with remaining capacity w, we have two choices: skip item (dp[i-1][w]) or take item (val[i] + dp[i-1][w - weight[i]]). Taking max of both gives optimal choice.",
    identificationRules: [
      "Subset sum, partition equal subset sum, target sum questions.",
      "Each item can be chosen at most once.",
      "Constraint on total weight/sum capacity."
    ],
    approachSteps: [
      "Define `dp[w]` as max value achievable with capacity `w`.",
      "Loop through each item.",
      "Traverse capacity backwards `w` from `capacity` down to `weight[i]` to prevent reuse in same step.",
      "Transition: `dp[w] = max(dp[w], val[i] + dp[w - weight[i]])`."
    ],
    complexity: {
      time: "O(N * W)",
      space: "O(W) 1D array space optimization"
    },
    pseudocode: `function knapsack(weights, values, W):
    dp = array of size (W + 1) initialized to 0
    for i from 0 to len(weights) - 1:
        for w from W down to weights[i]:
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
    return dp[W]`,
    codeTemplates: {
      cpp: `int knapsack(vector<int>& weights, vector<int>& values, int W) {
    vector<int> dp(W + 1, 0);
    for (int i = 0; i < weights.size(); i++) {
        for (int w = W; w >= weights[i]; w--) {
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]]);
        }
    }
    return dp[W];
}`,
      java: `public int knapsack(int[] weights, int[] values, int W) {
    int[] dp = new int[W + 1];
    for (int i = 0; i < weights.length; i++) {
        for (int w = W; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]]);
        }
    }
    return dp[W];
}`,
      python: `def knapsack(weights: list[int], values: list[int], W: int) -> int:
    dp = [0] * (W + 1)
    for i in range(len(weights)):
        for w in range(W, weights[i] - 1, -1):
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
    return dp[W]`,
      javascript: `function knapsack(weights, values, W) {
    const dp = new Array(W + 1).fill(0);
    for (let i = 0; i < weights.length; i++) {
        for (let w = W; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]]);
        }
    }
    return dp[W];
}`
    },
    problems: [
      {
        id: "prob-12",
        title: "Partition Equal Subset Sum",
        slug: "partition-equal-subset-sum",
        difficulty: "MEDIUM",
        platform: "LeetCode #416",
        solveUrl: "https://leetcode.com/problems/partition-equal-subset-sum/",
        orderIndex: 1,
        status: "SOLVED"
      },
      {
        id: "prob-13",
        title: "Target Sum",
        slug: "target-sum",
        difficulty: "MEDIUM",
        platform: "LeetCode #494",
        solveUrl: "https://leetcode.com/problems/target-sum/",
        orderIndex: 2,
        status: "ATTEMPTED"
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
