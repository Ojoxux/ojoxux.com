/**
 * シード付きの乱数。毎フレーム数千回呼ぶので、BigInt を使わない sfc32 を使う。
 */
export class Rng {
	#a: number;
	#b: number;
	#c: number;
	#d: number;

	constructor(seed: number) {
		// splitmix32 でシードを 4 語に広げる
		let s = seed >>> 0;
		const next = () => {
			s = (s + 0x9e3779b9) >>> 0;
			let z = s;
			z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
			z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
			return (z ^ (z >>> 16)) >>> 0;
		};
		this.#a = next();
		this.#b = next();
		this.#c = next();
		this.#d = next();
		// 最初の数回は偏るので捨てる
		for (let i = 0; i < 12; i++) this.next();
	}

	/** [0, 1) の一様乱数 */
	next(): number {
		const t = (((this.#a + this.#b) >>> 0) + this.#d) >>> 0;
		this.#d = (this.#d + 1) >>> 0;
		this.#a = this.#b ^ (this.#b >>> 9);
		this.#b = (this.#c + (this.#c << 3)) >>> 0;
		this.#c = (this.#c << 21) | (this.#c >>> 11);
		this.#c = (this.#c + t) >>> 0;
		return t / 4294967296;
	}

	/** [lo, hi) の一様乱数 */
	rand(lo: number, hi: number): number {
		return this.next() * (hi - lo) + lo;
	}

	/** [lo, hi) の整数 */
	randInt(lo: number, hi: number): number {
		return Math.floor(this.rand(lo, hi));
	}

	/** 配列から 1 つ選ぶ。空配列は渡さないこと */
	pick<A>(xs: ReadonlyArray<A>): A {
		return xs[this.randInt(0, xs.length)] as A;
	}
}
