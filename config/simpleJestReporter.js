class SimpleJestReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this.passed = [];
  }

  onTestResult(test, testResult) {
    testResult.testResults.forEach((assertion) => {
      if (assertion.status === 'passed') {
        this.passed.push({ fullName: assertion.fullName, file: testResult.testFilePath });
      }
    });
  }

  onRunComplete(contexts, results) {
    console.log('\n=== Ringkasan Test (passed) ===');
    if (this.passed.length === 0) {
      console.log('Tidak ada test yang lulus.');
    } else {
      this.passed.forEach((p) => {
        console.log(`- ${p.fullName}`);
      });
    }
    console.log(`\nTotal: ${results.numPassedTests} passed, ${results.numTotalTests} total`);
    // print failed tests briefly
    if (results.numFailedTests > 0) {
      console.log(`\nFailed: ${results.numFailedTests} tests. Lihat output lengkap dengan --reporters=default atau jalankan 'npm run test:coverage'.`);
    }
  }
}

module.exports = SimpleJestReporter;
