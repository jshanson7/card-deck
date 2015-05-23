var VALUES = 'A,2,3,4,5,6,7,8,9,10,J,Q,K'.split(',');
var SUITS = ['♣','♠','♥','♦'];

function Base(options) {
  _.extend(this, _.result(this, 'defaults'), options);
  _.bindAll(this);
}
function Card() { Base.apply(this, arguments); }
function Deck() { Base.apply(this, arguments); }
function CardView() { Base.apply(this, arguments); }
function DeckView() { Base.apply(this, arguments); }

_.extend(Card.prototype, {
  defaults: {
    'value': null,
    'suit': null,
    'selected': false
  },
  getStrength: function () {
    return VALUES.indexOf(this.value);
  },
  setSelected: function (value) {
    this.selected = value;
  },
  toggleSelected: function () {
    this.setSelected(!this.selected);
  }
});

_.extend(Deck.prototype, {
  defaults: function () {
    return {
      'cards': _.flatten(_.map(VALUES, function (val) {
        return _.map(SUITS, function (suit) {
          return new Card({'value': val, 'suit': suit});
        });
      }))
    };
  },
  getCardsForSuit: function (suit) {
    return _.where(this.cards, { 'suit': suit });
  },
  selectHand: function (numberOfCards) {
    _(this.cards)
      .sample(numberOfCards)
      .invoke('setSelected', true)
      .run();
  }
});

_.extend(CardView.prototype, {
  defaults: { 'card': null },
  events: function () {
    return {
      'click': _.flow(this.card.toggleSelected, this.onSelectionToggle)
    };
  },
  onSelectionToggle: function () {
    this.$el.toggleClass('selected', this.card.selected);
  },
  renderBigIcon: function () {
    return $('<div/>', {
      class: 'big-icon',
      html: this.card.suit
    });
  },
  renderIcon: function () {
    return $('<div/>', {
      class: 'card-icon',
      html: this.card.suit
    });
  },
  renderIcons: function () {
    var cardStrength = this.card.getStrength();
    return $('<div/>', {
      class: 'card-icons',
      html: cardStrength !== 0 && cardStrength < 10 ?
        _.map(_.range(cardStrength + 1), this.renderIcon) :
        this.renderBigIcon()
    });
  },
  renderValue: function (position) {
    return $('<div/>', {
      class: 'card-value card-value-' + position,
      html: this.card.value
    });
  },
  render: function () {
    var $old = this.$el;
    
    this.$el = $('<div/>', {
      class: 'card suit-' + this.card.suit + ' value-' + this.card.value +
        (this.card.selected ? ' selected' : ''),
      html: [
        this.renderValue('top'),
        this.renderIcons(),
        this.renderValue('bottom')
      ],
      on: _.result(this, 'events')
    });
    
    if ($old) {
      this.$el.insertAfter( $old.off() );
      $old.remove();
    }
    return this.$el;
  }
});

_.extend(DeckView.prototype, {
  defaults: function () { return { 'deck': new Deck() }; },
  events: function () {
    return {
      'click .card': this.renderSelectionCount
    };
  },
  renderSelectionCount: function () {
    var $old = this.$selectionCount;

    this.$selectionCount = $('<div/>', {
      class: 'selection-count',
      html: 'Selected: ' +
        _.where( this.deck.cards, {'selected': true}).length
    });
    
    if ($old) {
      this.$selectionCount.insertAfter( $old );
      $old.remove();
    }
    return this.$selectionCount;
  },
  renderCard: function (card) {
    return new CardView({'card': card}).render();
  },
  renderCardRow: function (cards) {
    return $('<div/>', {
      class: 'card-row',
      html: _.map(cards, this.renderCard)
    });
  },
  renderDeckBySuits: function () {
    var renderCardRowForSuit = _.compose(
      this.renderCardRow,
      this.deck.getCardsForSuit
    );
    return _.map(SUITS, renderCardRowForSuit);
  },
  render: function () {
    var $old = this.$el;
    
    this.$el = $('<div/>', {
      class: 'deck-view',
      html: [].concat(
        this.renderDeckBySuits(),
        this.renderSelectionCount()
      ),
      on: _.result(this, 'events')
    });
    
    if ($old) {
      this.$el.insertAfter($old.off());
      $old.remove();
    }
    return this.$el;
  }
});

var deck = new Deck();
var deckView = new DeckView({'deck': deck});
deck.selectHand(5);

$('#content').html(deckView.render());