/**
 * Test script for payment endpoint error path
 * Tests the logger integration with a failing payment
 *
 * OPTION 1: Run from browser console (while logged in):
 * Copy the code from the testInBrowser() function below into your browser console
 *
 * OPTION 2: Run with Node (requires bypassing auth):
 * npx tsx src/scripts/test-payment-error.ts
 */

// Browser-friendly test (copy this into browser console while logged in)
function testInBrowser() {
	const testData = {
		locationId: 'LWSA7ZHB2BHV3',
		sourceId: 'cnon:card-nonce-declined',
		amount: 1000,
		email: 'george@westborn.com.au',
		note: 'Test payment failure',
		reference_id: 'test-error-' + Date.now()
	};

	fetch('/api/payment', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(testData)
	})
		.then((r) => {
			console.log('Status:', r.status);
			return r.text();
		})
		.then((data) => {
			try {
				console.log('Response:', JSON.parse(data));
			} catch {
				console.log('Response:', data);
			}
			console.log('✅ Check logs: pnpm studio → logTable → filter by ERROR');
		});
}

console.log('\n📋 COPY THIS INTO YOUR BROWSER CONSOLE (while logged in):');
console.log('─'.repeat(60));
console.log(testInBrowser.toString());
console.log('\ntestInBrowser();');
console.log('─'.repeat(60));
console.log('\nOR test from Node (will hit auth redirect):\n');

async function testPaymentError() {
	console.log('🧪 Testing payment error path...\n');

	const testData = {
		locationId: 'LWSA7ZHB2BHV3',
		sourceId: 'cnon:card-nonce-declined', // Square test nonce that will fail
		amount: 1000,
		email: 'george@westborn.com.au',
		note: 'Test payment failure',
		reference_id: 'test-error-' + Date.now()
	};

	console.log('📤 Sending request with data:', JSON.stringify(testData, null, 2));

	try {
		const response = await fetch('http://localhost:5173/api/payment', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(testData)
		});

		console.log('\n📥 Response Status:', response.status, response.statusText);

		const data = await response.text();
		console.log('\n📄 Response Body:');
		try {
			const json = JSON.parse(data);
			console.log(JSON.stringify(json, null, 2));
		} catch {
			console.log(data);
		}

		if (response.status === 400) {
			console.log('\n✅ Error path triggered successfully!');
			console.log('💾 Check your database logs with:');
			console.log('   pnpm studio');
			console.log('   OR run this SQL:');
			console.log(
				"   SELECT * FROM log WHERE level = 'ERROR' AND route_id = '/api/payment' ORDER BY created_at DESC LIMIT 1;"
			);
		} else {
			console.log('\n❌ Expected status 400, got', response.status);
		}
	} catch (error) {
		console.error('\n❌ Request failed:', error);
		console.log('\n💡 Make sure your dev server is running: pnpm dev');
	}
}

testPaymentError();
