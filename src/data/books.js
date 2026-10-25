// User-provided reading list. Descriptions are neutral summaries, not invented personal reviews.
export const books = [
  {
    id: 'hpbn', category: 'tech', type: 'Book',
    title: 'High Performance Browser Networking', author: 'Ilya Grigorik',
    description: 'A practical guide to browser networking, from TCP and TLS to HTTP, WebSockets, and techniques for faster web applications.',
    cover: 'books/hpbn.jpg', color: '#b7d6c7', width: 48, height: 249,
    url: 'https://hpbn.co/', linkLabel: 'Read online'
  },
  {
    id: 'react-ui-runtime', category: 'tech', type: 'Article',
    title: 'React as a UI Runtime', author: 'Dan Abramov',
    description: 'An essay on React’s programming model, exploring elements, rendering, reconciliation, and how the runtime fits together.',
    cover: 'books/react-ui-runtime.svg', color: '#b6c8e5', stacked: true, width: 200, height: 43,
    url: 'https://overreacted.io/react-as-a-ui-runtime/', linkLabel: 'Read article'
  },
  {
    id: 'ddia', category: 'tech', type: 'Book',
    title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann',
    description: 'How databases and distributed systems handle storage, replication, partitioning, consistency, and the trade-offs behind reliable data applications.',
    cover: 'books/ddia.jpg', color: '#dcb4ac', width: 82, height: 257,
    url: 'https://dataintensive.net/', linkLabel: 'Book details'
  },
  {
    id: 'distributed-systems', category: 'tech', type: 'Book',
    title: 'Understanding Distributed Systems', author: 'Roberto Vitillo',
    description: 'An introduction to communication, coordination, scalability, and resilience in distributed applications.',
    cover: 'books/distributed-systems.jpg', color: '#e5c49b', stacked: true, width: 210, height: 46,
    url: 'https://understandingdistributed.systems/', linkLabel: 'Book details'
  },
  {
    id: 'frankenstein', category: 'non-tech', type: 'Book',
    title: 'Frankenstein', author: 'Mary Shelley',
    description: 'A scientist’s attempt to create life becomes a story about responsibility, isolation, and the consequences of unchecked ambition.',
    cover: 'books/frankenstein.jpg', color: '#bdb6d9', width: 45, height: 240,
    url: 'https://www.penguinrandomhouse.com/books/286385/frankenstein-by-mary-shelley-edited-with-an-introduction-and-notes-by-maurice-hindle-cover-illustration-by-coralie-bickford-smith/9780141393391/', linkLabel: 'Book details'
  },
  {
    id: 'kafka-on-the-shore', category: 'non-tech', type: 'Book',
    title: 'Kafka on the Shore', author: 'Haruki Murakami',
    description: 'A runaway teenager and an unusual elderly man follow intertwined journeys through memory, fate, and a dreamlike version of Japan.',
    cover: 'books/kafka-on-the-shore.jpg', color: '#bdc8a4', width: 72, height: 253,
    url: 'https://www.penguinrandomhouse.com/books/118718/kafka-on-the-shore-by-haruki-murakami/9781400079278/', linkLabel: 'Book details'
  },
  {
    id: 'metamorphosis', category: 'non-tech', type: 'Book',
    title: 'The Metamorphosis', author: 'Franz Kafka',
    description: 'Gregor Samsa wakes up transformed into an insect; Kafka uses the impossible event to explore work, family, and alienation.',
    cover: 'books/metamorphosis.jpg', color: '#dfbaa7', width: 38, height: 225,
    url: 'https://www.penguinrandomhouse.com/books/621164/the-metamorphosis-by-franz-kafka/', linkLabel: 'Book details'
  },
  {
    id: 'of-mice-and-men', category: 'non-tech', type: 'Book',
    title: 'Of Mice and Men', author: 'John Steinbeck',
    description: 'Two migrant workers hold on to a shared dream of owning a farm in Depression-era California.',
    cover: 'books/of-mice-and-men.jpg', color: '#a9c5ca', width: 51, height: 234,
    url: 'https://www.penguin.co.uk/books/55510/of-mice-and-men-by-steinbeck-john/9780141923475', linkLabel: 'Book details'
  },
  {
    id: 'fahrenheit-451', category: 'non-tech', type: 'Book',
    title: 'Fahrenheit 451', author: 'Ray Bradbury',
    description: 'A fireman in a society that burns books begins to question censorship, conformity, and the world around him.',
    cover: 'books/fahrenheit-451.jpg', color: '#dfc798', width: 76, height: 245, lean: 3,
    url: 'https://www.simonandschuster.net/books/Fahrenheit-451/Ray-Bradbury/9781451673319', linkLabel: 'Book details'
  },
  {
    id: 'catch-22', category: 'non-tech', type: 'Book',
    title: 'Catch-22', author: 'Joseph Heller',
    description: 'A dark satire about a bombardier navigating military bureaucracy and the circular logic of war.',
    cover: 'books/catch-22.jpg', color: '#b6c8e5', stacked: true, width: 179, height: 43,
    url: 'https://www.simonandschuster.net/books/Catch-22/Joseph-Heller/9781451621174', linkLabel: 'Book details'
  },
  {
    id: 'piranesi', category: 'non-tech', type: 'Book',
    title: 'Piranesi', author: 'Susanna Clarke',
    description: 'A man records his life in an immense house of statues and tides, gradually questioning what he knows about his world.',
    cover: 'books/piranesi.jpg', color: '#c8b8d9', stacked: true, width: 173, height: 39,
    url: 'https://www.bloomsbury.com/us/piranesi-9781635577808/', linkLabel: 'Book details'
  }
];
