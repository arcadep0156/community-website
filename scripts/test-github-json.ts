/**
 * Test script to verify GitHub JSON API is working
 * Run: npx tsx scripts/test-github-json.ts
 */

async function testGitHubJSON() {
  const INDEX_URL = 'https://raw.githubusercontent.com/TrainWithShubham/interview-questions/main/index.json';
  const SAMPLE_URL = 'https://raw.githubusercontent.com/TrainWithShubham/interview-questions/main/data/2024/amazon.json';

  try {
    console.log('🧪 Testing GitHub JSON API...\n');

    // Test 1: Fetch index.json
    console.log('1️⃣ Fetching index.json...');
    const indexRes = await fetch(INDEX_URL);
    if (!indexRes.ok) throw new Error(`Index not accessible: ${indexRes.status}`);
    const index = await indexRes.json();
    console.log(`✅ Index fetched successfully`);
    console.log(`   Total Questions: ${index.totalQuestions}`);
    console.log(`   Companies: ${index.metadata.companies.length}`);
    console.log(`   Years: ${index.metadata.years.join(', ')}\n`);

    // Test 2: Fetch sample question file
    console.log('2️⃣ Fetching sample question file (Amazon 2024)...');
    const sampleRes = await fetch(SAMPLE_URL);
    if (!sampleRes.ok) throw new Error(`Sample file not accessible: ${sampleRes.status}`);
    const sample = await sampleRes.json();
    console.log(`✅ Sample file fetched successfully`);
    console.log(`   Company: ${sample.company}`);
    console.log(`   Year: ${sample.year}`);
    console.log(`   Questions: ${sample.questions.length}`);
    console.log(`   First Question ID: ${sample.questions[0].id}\n`);

    // Test 3: Verify contributor format
    console.log('3️⃣ Checking contributor format...');
    const contributor = sample.questions[0].contributor;
    if (typeof contributor === 'object') {
      console.log(`✅ Contributor is object format`);
      console.log(`   Name: ${contributor.name || 'N/A'}`);
      console.log(`   GitHub: ${contributor.github}`);
      console.log(`   LinkedIn: ${contributor.linkedin || 'N/A'}\n`);
    } else {
      console.log(`⚠️  Contributor is string format: ${contributor}\n`);
    }

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testGitHubJSON();
