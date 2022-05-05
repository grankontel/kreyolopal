const hunspell = require('./lib.spellcheck');

const spellchecker = {
  check: (message) =>
    new Promise((resolve, reject) => {
      hunspell(message.request, message.kreyol)
        .then((response) => {
          const msgresponse = {
            // status: '', success | warning | error
            status: response.unknown_words.length > 0 ? 'warning' : 'success',
            kreyol: 'GP', // message.request.kreyol,
            unknown_words: response.unknown_words,
            message: response.message,
            user_evaluation: undefined,
            admin_evaluation: undefined,
          };

          resolve(msgresponse);
        })
        .catch((err) => {
          reject(err);
        });
    }),
};

module.exports = spellchecker;
