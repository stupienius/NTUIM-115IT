// ========================================
// DATABASE
// ========================================

const DB = {
    users: [
        {
            id: 1,
            name: "stupienius",
            posts: [
                {
                    id: 101,
                    title: "Why is midterm coming?",
                    content: "My first midterm exam at NTU is coming. I'm so nervous!",
                    time: "2 hours ago",
                    likes: 128,
                    comments: [
                        { user: "alice", text: "haha" },
                        { user: "bob", text: "too easy for you" }
                    ]
                },
                {
                    id: 102,
                    title: "Learning JavaScript",
                    content: "Today I learned about async and await!",
                    time: "5 hours ago",
                    likes: 42,
                    comments: [
                        { user: "alice", text: "Good job!" },
                        { user: "bob", text: "Keep learning!" }
                    ]
                }
            ]
        },
        {
            id: 2,
            name: "alice",
            posts: [
                {
                    id: 201,
                    title: "Hello World",
                    content: "Just joined Threads!",
                    time: "1 day ago",
                    likes: 76,
                    comments: [
                        { user: "stupienius", text: "Welcome!" }
                    ]
                }
            ]
        }
    ]
};


// ========================================
// SIMULATED API REQUESTS
// ========================================

// Simulate network latency
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// Get all users
async function getUsers() {
    await delay(1000);
    return DB.users;
}

// Get posts from a user
async function getPosts(user) {
    await delay(1000);
    return user.posts;
}

// Get comments from a post
async function getComments(post) {
    await delay(1000);
    return post.comments;
}


// ========================================
// TERMINAL UI
// ========================================

const WIDTH = 57;

// Print text inside a bordered box
function boxLine(text = "") {
    const length = [...text].length;

    console.log(
        "  │  " +
        text +
        " ".repeat(Math.max(0, WIDTH - length - 4)) +
        "  │"
    );
}

// Print separator
function separator() {
    boxLine("─".repeat(WIDTH - 4));
}

// Print header
function printHeader() {
    console.clear();

    console.log("  ╭" + "─".repeat(WIDTH) + "╮");

    boxLine();
    boxLine("                 ◎  T H R E A D S");
    boxLine();
    separator();
    boxLine();
    boxLine("Home        Search        Activity        Profile");
    boxLine();

    console.log("  ╰" + "─".repeat(WIDTH) + "╯\n");
}

// Print a post
function printPost(user, post, comments) {
    const left = `◉  ${user.name}`;
    const right = post.time;

    const spaces = " ".repeat(
        Math.max(1, WIDTH - left.length - right.length - 4)
    );

    boxLine();
    boxLine(left + spaces + right);

    boxLine("│");
    boxLine(`│  ${post.title}`);
    boxLine("│");

    // Wrap post content
    const words = post.content.split(" ");
    let line = "";

    for (const word of words) {
        if ((line + word).length > WIDTH - 9) {
            boxLine("│  " + line.trim());
            line = "";
        }

        line += word + " ";
    }

    if (line) {
        boxLine("│  " + line.trim());
    }

    boxLine("│");
    boxLine(`│  ♡  ${post.likes}    ♧  ${comments.length}    ↗  Share`);
    boxLine("│");

    // Print comments
    comments.forEach((comment, index) => {
        const last = index === comments.length - 1;

        boxLine(`${last ? "└" : "├"}── ◉ ${comment.user}`);
        boxLine(`${last ? " " : "│"}      ${comment.text}`);

        if (!last) {
            boxLine("│");
        }
    });

    boxLine();
}


// ========================================
// MAIN APPLICATION
// ========================================

async function loadThreadFeed() {
    printHeader();

    console.log("  ◌ Connecting to database...");

    const users = await getUsers();

    console.log("  ● Users loaded!");
    console.log("  ◌ Fetching posts and comments...\n");

    // Fetch everything concurrently
    const feed = await Promise.all(
        users.map(async (user) => {

            const posts = await getPosts(user);

            const loadedPosts = await Promise.all(
                posts.map(async (post) => {

                    const comments = await getComments(post);

                    return {
                        user,
                        post,
                        comments
                    };

                })
            );

            return loadedPosts;
        })
    );

    // Flatten nested arrays
    const allPosts = feed.flat();

    console.log("  ● Posts loaded!\n");

    console.log("  ╭" + "─".repeat(WIDTH) + "╮");

    allPosts.forEach(({ user, post, comments }, index) => {
        printPost(user, post, comments);

        if (index < allPosts.length - 1) {
            separator();
        }
    });

    console.log("  ╰" + "─".repeat(WIDTH) + "╯");

    console.log("\n  ✓ Feed loaded successfully!");
}


// ========================================
// START
// ========================================

loadThreadFeed();

console.log("  JavaScript is still running!");
