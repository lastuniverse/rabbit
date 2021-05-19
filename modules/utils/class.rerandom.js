class Rerandom {
	constructor(seed=0){
		this.seed = seed;

		this.p1 = 2654435761;
		this.p2 = 2246822519;
		this.p3 = 3266489917;
		this.p4 = 668265263;
		this.p5 = 374761393;

		this.p=[this.p1,this.p2,this.p3,this.p4,this.p5];
		this.cut = 4294967295;

		this.getValue = this._GetXxHash;
	}
	
	_RotateLeft(value, count) {
		return (value << count) | (value >>> (32 - count));
	};

	_CalcSubHash(value, read_value) {
		value += read_value * this.p2;
		value = this._RotateLeft (value, 13);
		value *= this.p1;
		return value;
	};

	_GetXxHash(...buf) {
		let h32;
		let index = 0;
		let len = buf.length;

		if (len >= 4) {
			let limit = len - 4;
			let v1 = this.seed + this.p1 + this.p2;
			let v2 = this.seed + this.p2;
			let v3 = this.seed + 0;
			let v4 = this.seed - this.p1;

			while (index <= limit) {
				v1 = this._CalcSubHash (v1, buf[index]);
				index++;
				v2 = this._CalcSubHash (v2, buf[index]);
				index++;
				v3 = this._CalcSubHash (v3, buf[index]);
				index++;
				v4 = this._CalcSubHash (v4, buf[index]);
				index++;
			}

			h32 = this._RotateLeft (v1, 1) + this._RotateLeft (v2, 7) + this._RotateLeft (v3, 12) + this._RotateLeft (v4, 18);
		}
		else {
			h32 = this.seed + this.p5;
		}

		h32 += len * 4;

		while (index < len) {
			h32 += buf[index] * this.p3;
			h32 = this._RotateLeft (h32, 17) * this.p4;
			index++;
		}

		h32 ^= h32 >>> 15;
		h32 *= this.p2;
		h32 ^= h32 >>> 13;
		h32 *= this.p3;
		h32 ^= h32 >>> 16;

		return (h32>>>0)/4294967295.0;

	};
}

export default Rerandom;



	// exports.distributions.normal = function(){ return new Normal(); };
	// function Normal() {
	// 	var count = 0;
	// 	this.next = function() {
	// 		var ret = 2.0 * rernd.rnd(count) - 1.0;
	// 		count += 1;
	// 		return ret;
	// 	}
	// }


	// exports.distributions.gauss = function(){ return new Gauss(); };
	// function Gauss() {
	// 	var ready = false;
	// 	var second = 0.0;
	// 	var count = 0;
	// 	this.next = function(mean, dev) {
	// 		mean = mean == undefined ? 0.0 : mean;
	// 		dev = dev == undefined ? 1.0 : dev;
			
	// 		if (this.ready) {
	// 			this.ready = false;
	// 			return this.second * dev + mean;
	// 		}
	// 		else {
	// 			var u, v, s;
	// 			do {
	// 				u = 2.0 * rernd.rnd(count) - 1.0;
	// 				v = 2.0 * rernd.rnd(count+1) - 1.0;
	// 				// u = 2.0 * Math.random() - 1.0;
	// 				// v = 2.0 * Math.random() - 1.0;
	// 				s = u * u + v * v;
	// 				count += 2;
	// 			} while (s > 1.0 || s == 0.0);
				
	// 			var r = Math.sqrt(-2.0 * Math.log(s) / s);
	// 			this.second = r * u;
	// 			this.ready = true;
	// 			return r * v * dev + mean;
	// 		}
	// 	};
	// }

	// // g = new Gauss(); // создаём объект
	// // a = g.next(); // генерируем пару значений и получаем первое из них
	// // b = g.next(); // получаем второе
	// // c = g.next(); // снова генерируем пару значений и получаем первое из них

	// exports.distributions.bernoulli = function(){ return new Bernoulli(); };
	// function Bernoulli() {
	// 	var count = 0;

	// 	var p = rernd.rnd(count);
	//     var q = 1.0 - p;
		
	// 	this.next = function() {
	// 		var r = rernd.rnd(count);
	// 		count += 1;
	// 		if( r > p)
	// 			return 1;
	// 		return 0;
	// 	}
	// }




