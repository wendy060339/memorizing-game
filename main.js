const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatches: 'CardsMatches',
  GameFinished: 'GameFinished',
}

const Symbol = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png',
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png',
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png',
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'
]

const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbol[Math.floor(index / 13)]
    return `
          <p>${number}</p>
          <img src="${symbol}">
          <p>${number}</p>`
  },

  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector("#cards")
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")
  },

  //flipCard(1,2,3,4,5) 可以接收N個參數，把參數們變成陣列
  flipCards(...cards) { //cards = [1,2,3,4,5]
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        //回傳正面
        return
      }
      card.classList.add('back')
      card.innerHTML = null
      //回傳背面
    })
  },

  pairCards(...cards) { //若配對成功的長相
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimed(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {//因CSS只能加一次，因此新增監聽器，在動畫撥完後觸發並移除
        card.classList.remove('wrong')
      },
        {
          once: true //要求在事件執行一次之後，就要卸載這個監聽器
        }
      )
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Completed!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}


const model = {
  revealedCards: [],

  isReavealedCardsMatched() { //比對兩張牌數字是否相同
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCard() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照不同的遊戲狀態，做不同行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card) // 1. 翻牌
        model.revealedCards.push(card) // 2. 把牌放進model資料庫
        this.currentState = GAME_STATE.SecondCardAwaits // 3. 狀態改為等待翻第二張牌
        break

      case GAME_STATE.SecondCardAwaits: // 本次判斷配對是否成功
        view.renderTriedTimed((++model.triedTimes))

        view.flipCards(card)
        model.revealedCards.push(card)
        if (model.isReavealedCardsMatched()) {
          //配對正確，變色
          view.renderScore((model.score += 10))
          this.currentState = GAME_STATE.CardsMatches
          view.pairCards(...model.revealedCards)
          model.revealedCards = []

          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits

        } else {
          //配對失敗，蓋牌
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }

    console.log('current state:', this.currentState)
    console.log('reaveled cards:', model.revealedCards)
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits // 因resetCards位於setTimeout裡，所以不能用this呼叫
  }
}

controller.generateCard()

//Node List (array-like)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })

})

