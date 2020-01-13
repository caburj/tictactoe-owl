const { Component, Store, useState } = owl;
const { useStore, useGetters, useDispatch } = owl.hooks;

//------------------------------------------------------------------------------
// Utility
//------------------------------------------------------------------------------

const WINNINGCOMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// check whether all elements in arr1 is in arr2
const allIn = (arr1, arr2) => {
    for (let x of arr1) {
        if (!arr2.includes(x)) return false;
    }
    return true;
};


//------------------------------------------------------------------------------
// state, actions, getters for Store declaration
//------------------------------------------------------------------------------

// initial state
const state = {
    currentPlayer: 1,
    cells: [...Array(9)].map((v, i) => {
        return { owner: null, id: i };
    })
};

const actions = {
    assignCell({ state }, cellId) {
        const cell = state.cells.find(cell => cell.id === cellId);
        cell.owner = state.currentPlayer;
    },
    changePlayer({ state }) {
        state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
    },
    resetGame({ state }) {
        for (let cell of state.cells) {
            cell.owner = null;
        }
    }
};

const getters = {
    _getPlayerCells({ state }, player) {
        return state.cells
            .filter(cell => cell.owner === player)
            .map(cell => cell.id);
    },
    getWinner({ getters }) {
        const p1CellIds = getters._getPlayerCells(1);
        const p2CellIds = getters._getPlayerCells(2);
        for (let combi of WINNINGCOMBINATIONS) {
            if (allIn(combi, p1CellIds)) return 1;
            if (allIn(combi, p2CellIds)) return 2;
        }
        return null;
    }
};


//------------------------------------------------------------------------------
// Components
//------------------------------------------------------------------------------

class TicTacToe extends Component {
    constructor() {
        super(...arguments);
        this.state = useStore(state => state);
        this.getters = useGetters();
        this.dispatch = useDispatch();
    }
    get winner() {
        return this.getters.getWinner();
    }
    reset() {
        this.dispatch("resetGame");
    }
}

class Cell extends Component {
    constructor() {
        super(...arguments);
        this.state = useState(this.props.cell);
        this.dispatch = useDispatch();
        this.getters = useGetters();
    }
    get iconClass() {
        return this.state.owner === 1
            ? "fa fa-circle"
            : this.state.owner === 2
            ? "fa fa-circle-o"
            : null;
    }
    select() {
        if (!this.getters.getWinner() && !this.state.owner) {
            this.dispatch("assignCell", this.state.id);
            this.dispatch("changePlayer");
        }
    }
}


// register child components
TicTacToe.components = { Cell };


//------------------------------------------------------------------------------
// Application initialization
//------------------------------------------------------------------------------

async function start() {
    const templates = await owl.utils.loadFile("./templates.xml");
    TicTacToe.env = {
        qweb: new owl.QWeb({ templates }),
        store: new Store({
            state,
            actions,
            getters
        })
    };
    const app = new TicTacToe();
    await app.mount(document.getElementById("main"));
}

start();
