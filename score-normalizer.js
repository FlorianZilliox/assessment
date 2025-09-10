// score-normalizer.js - Normalisation des scores pour différents types de questions

export class ScoreNormalizer {
  static normalizeScore(question, selectedOption) {
    if (question.type === 'A') {
      return selectedOption;
    }
    // Pour Type B et C, trouve la valeur dans les options
    const option = question.options.find(o => o.label === selectedOption);
    return option ? option.value : null;
  }
}