interface String{
	/**
	 * 
	 * @param args
	 * `'test {0} demo {1}'.format('data1','data2')`
	 * @return `'test data1 demo data2'`
	 */
	format(...args:any[]):string;
}
String.prototype.format = function () {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function (match, number) {
		return typeof args[number] != 'undefined'
			? args[number]
			: match
			;
	});
};