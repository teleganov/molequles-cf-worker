import { Hono } from 'hono';
import { systemPrompt } from './prompt';

export interface Env {
	// key should match ai.binding value in wrangler.jsonc
	AI: Ai;
}

// TODO: Fix typings once ts bindings exist for gpt-oss-20b model
const openAiResultHandler = (result: Record<string, any>) => {
	if (result.output && Array.isArray(result.output) && result.output.length) {
		const resultMessage = result.output.find((m: Record<string, any>) => m.type === 'message');
		if (resultMessage?.content && Array.isArray(resultMessage.content)) {
			const contentObj = resultMessage.content.find((c: Record<string, any>) => c.type === 'output_text');
			if (contentObj) {
				return {
					output: contentObj.text
				};
			}
		}
	}
};

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
	return c.text('Hello World');
});

app.post('/normalize', async (c) => {
	let data: any;
	try {
		data = await c.req.json();
	} catch {
		return c.json({ error: 'Invalid JSON' }, 400);
	}

	const { input } = data;
	if (!input) {
		return c.json({ error: 'JSON missing "input" field' }, 400);
	}

	const openAiInput = {
		instructions: systemPrompt,
		input,
		reasoning: {
			// Setting reasoning to low keeps request lightweight.
			// medium/high did not yield any meaningful improvements in normalization.
			effort: 'low',
			summary: 'concise',
		}
	};

	// @ts-ignore: Allow gpt model which doesn't currently have ts bindings
	const response = await c.env.AI.run("@cf/openai/gpt-oss-20b", openAiInput);
	const result = openAiResultHandler(response);
	if (!result) {
		return c.json({ error: 'Formula normalization failed' }, 500);
	}

	return c.json(result);
});

export default app;
