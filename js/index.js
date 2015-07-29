var VALUES = 'A,2,3,4,5,6,7,8,9,10,J,Q,K'.split(',');
var SUITS = ['♣', '♠', '♥', '♦'];

function BaseClass(options) {
  _.assign(this, _.result(this, 'defaults'), options);
  _.bindAll(this);
}

function Card() {
  BaseClass.apply(this, arguments);
}

Card.prototype = {
  defaults: {
    value: null,
    suit: null,
    selected: false
  },
  getStrength: function() {
    return VALUES.indexOf(this.value);
  },
  setSelected: function(value) {
    this.selected = value;
    return this;
  },
  toggleSelected: function() {
    return this.setSelected(!this.selected);
  }
};

function Deck() {
  BaseClass.apply(this, arguments);
}

Deck.prototype = {
  defaults: function() {
    return {
      cards: _.reduce(VALUES, function(cards, val) {
        return cards.concat(SUITS.map(function(suit) {
          return new Card({
            value: val,
            suit: suit
          });
        }));
      }, [])
    };
  },
  getCardsForSuit: function(suit) {
    return _.where(this.cards, {
      suit: suit
    });
  },
  selectHand: function(numberOfCards) {
    _(this.cards)
      .invoke('setSelected', false)
      .sample(numberOfCards)
      .invoke('setSelected', true)
      .run();
  }
};

function CardView() {
  BaseClass.apply(this, arguments);
}

CardView.prototype = {
  defaults: {
    card: null
  },
  renderBigIcon: function() {
    return $('<div/>', {
      class: 'big-icon',
      html: this.card.suit
    });
  },
  renderIcon: function() {
    return $('<div/>', {
      class: 'card-icon',
      html: this.card.suit
    });
  },
  renderIcons: function() {
    var cardStrength = this.card.getStrength();
    return $('<div/>', {
      class: 'card-icons',
      html: cardStrength !== 0 && cardStrength < 10 ?
        _.range(cardStrength + 1).map(this.renderIcon) : this.renderBigIcon()
    });
  },
  renderValue: function(position) {
    return $('<div/>', {
      class: 'card-value card-value-' + position,
      html: this.card.value
    });
  },
  render: function() {
    var $old = this.$el;

    this.$el = $('<div/>', {
      class: 'card suit-' + this.card.suit +
        ' value-' + this.card.value +
        (this.card.selected ? ' selected' : ''),
      html: [
        this.renderValue('top'),
        this.renderIcons(),
        this.renderValue('bottom')
      ],
      click: _.flow(this.card.toggleSelected, this.render)
    });

    if ($old) {
      this.$el.insertAfter($old);
      $old.off().remove();
    }
    return this.$el;
  }
};

function DeckView() {
  BaseClass.apply(this, arguments);
}

DeckView.prototype = {
  defaults: function() {
    return {
      deck: new Deck()
    };
  },
  selectHand: function(numberOfCards) {
    this.deck.selectHand(_.isNumber(numberOfCards) ? numberOfCards : 5);
    this.render();
  },
  renderMenu: function() {
    return $('<div/>', {
      class: 'menu',
      html: [
        this.renderSelectionCount(),
        this.renderSelectHandButton()
      ]
    })
  },
  renderSelectHandButton: function() {
    var $old = this.$selectHand;

    this.$selectHand = $('<button/>', {
      class: 'select-hand',
      html: 'Select Hand',
      click: this.selectHand
    });

    if ($old) {
      this.$selectHand.insertAfter($old);
      $old.remove();
    }
    return this.$selectHand;
  },
  renderSelectionCount: function() {
    var $old = this.$selectionCount;

    this.$selectionCount = $('<span/>', {
      class: 'selection-count',
      html: 'Selected: ' +
        _.where(this.deck.cards, {
          selected: true
        }).length
    });

    if ($old) {
      this.$selectionCount.insertAfter($old);
      $old.remove();
    }
    return this.$selectionCount;
  },
  renderCard: function(card) {
    return new CardView({
      card: card
    }).render();
  },
  renderCardRow: function(cards) {
    return $('<div/>', {
      class: 'card-row',
      html: cards.map(this.renderCard)
    });
  },
  renderDeckBySuits: function() {
    var renderCardRowForSuit = _.compose(
      this.renderCardRow,
      this.deck.getCardsForSuit
    );
    return SUITS.map(renderCardRowForSuit);
  },
  render: function() {
    var $old = this.$el;

    this.$el = $('<div/>', {
      class: 'deck-view',
      html: [].concat(
        this.renderMenu(),
        this.renderDeckBySuits()
      ),
      click: this.renderSelectionCount
    });

    if ($old) {
      this.$el.insertAfter($old);
      $old.off().remove();
    }
    return this.$el;
  }
};

var deckView = new DeckView();
deckView.selectHand(5);

$('#content').html(deckView.render());