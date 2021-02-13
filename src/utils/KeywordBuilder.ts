interface Keyword {
    words: string[]
    isRequire: boolean
}

export default class KeywordBuilder {
    private keywords: Keyword[] = []
    private seperateKey: string = " "

    public setSeperateKey(key: string) {
        this.seperateKey = key
    }

    public addKeyword(word: string, isRequire: boolean = false): KeywordBuilder {
        this.addKeywords([word], isRequire)
        return this
    }

    public addKeywords(words: string[], isRequire: boolean = false): KeywordBuilder {
        this.keywords.push({
            words,
            isRequire
        })
        return this
    }

    public build(): string[] {
        let results: string[] = []
        for (let i = 0; i < this.keywords.length; i++) {
            const keyword: Keyword = this.keywords[i];
            
            if (keyword.isRequire && results.length < 1) {
                results = keyword.words
                continue
            }

            let newResult: string[] = this.concatKeyword(results, keyword)

            if (keyword.isRequire) {
                results = newResult
            }else {
                results = [
                    ...results,
                    ...newResult
                ]
            }
        }

        return results
    }

    private concatKeyword(results: string[], keyword: Keyword): string[] {
        let newResult: string[] = []
        for (let j = 0; j < results.length; j++) {
            const result = results[j];
            
            for (let k = 0; k < keyword.words.length; k++) {
                const word = keyword.words[k];
                newResult.push(result + this.seperateKey + word)
            }
        }
        return newResult
    }
}