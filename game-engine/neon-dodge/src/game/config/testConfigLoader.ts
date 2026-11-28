import { loadGameConfig } from './ConfigLoader';

async function testConfig() {
    try {
        const config = await loadGameConfig(
            '/generated-configs/void-drifter.json'
        );

        console.log('Config loaded successfully!');
        console.log(config);

    } catch (error) {
        console.error('Config loading failed:', error);
    }
}

testConfig();