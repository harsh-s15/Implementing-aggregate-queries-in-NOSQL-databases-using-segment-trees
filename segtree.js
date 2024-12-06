const express = require("express");
const fs = require("fs");
const port = 8000;
let data = require("./data.json");

// Import the SegmentTree class from the previously created module or include it here directly.
class SegmentTree {
    constructor(arr) {
        this.n = arr.length;
        this.tree = new Array(2 * this.n).fill(0);
        this.build(arr);
    }

    build(arr) {
        for (let i = 0; i < this.n; i++) this.tree[this.n + i] = arr[i];
        for (let i = this.n - 1; i > 0; i--) this.tree[i] = this.tree[2 * i] + this.tree[2 * i + 1];
    }

    update(p, value) {
        for (this.tree[p += this.n] = value; p > 1; p = Math.floor(p / 2))
            this.tree[p >> 1] = this.tree[p] + this.tree[p ^ 1];
    }

    query(l, r) {
        let sum = 0;
        for (l += this.n, r += this.n; l < r; l >>= 1, r >>= 1) {
            if (l & 1) sum += this.tree[l++];
            if (r & 1) sum += this.tree[--r];
        }
        return sum;
    }
}

const app = express();
app.use(express.json());

// Build segment tree based on `scores` data
const scores = data.scores; // Assume `data.json` contains an array `scores`
const segTree = new SegmentTree(scores);

app.get("/", (req, res) => {
    return res.json({ message: "Welcome to the Segment Tree API" });
});

app.get("/query/:start/:end", (req, res) => {
    const start = parseInt(req.params.start);
    const end = parseInt(req.params.end);
    const result = segTree.query(start, end + 1);
    return res.json({ sum: result });
});

app.post("/update/:index", (req, res) => {
    const index = parseInt(req.params.index);
    const newValue = req.body.value;

    if (index < 0 || index >= scores.length) {
        return res.status(400).json({ error: "Index out of range" });
    }

    segTree.update(index, newValue);
    data.scores[index] = newValue;

    fs.writeFile("./data.json", JSON.stringify(data, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Failed to update data file" });
        return res.status(200).json({ message: "Value updated successfully" });
    });
});

app.listen(port, () => console.log(`Server started at port: ${port}`));
