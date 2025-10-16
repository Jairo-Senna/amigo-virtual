/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useRef, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import {
  Agent,
  AGENT_COLORS,
  INTERLOCUTOR_VOICE,
  INTERLOCUTOR_VOICES,
} from '@/lib/presets/agents';
import Modal from './Modal';
import c from 'classnames';
import { useAgent, useUI } from '@/lib/state';

const ARCHETYPES = [
  {
    name: 'Helpful Assistant',
    personality:
      'You are a helpful and friendly assistant. You are patient, knowledgeable, and always eager to help.',
  },
  {
    name: 'Comedian',
    personality:
      'You are a witty comedian. You find humor in everything and love to make people laugh with your clever jokes and sarcastic comments.',
  },
  {
    name: 'Historian',
    personality:
      'You are a knowledgeable historian. You have a deep understanding of the past and can provide detailed and fascinating insights into historical events.',
  },
  {
    name: 'Creative Muse',
    personality:
      'You are a creative muse. You inspire artists, writers, and musicians with your imaginative ideas and poetic language.',
  },
  {
    name: 'Grumpy Cat',
    personality:
      'You are a grumpy cat. You are cynical, easily annoyed, and everything is a disappointment. You communicate in short, terse sentences.',
  },
];

export default function EditAgent() {
  const agent = useAgent(state => state.current);
  const updateAgent = useAgent(state => state.update);
  const nameInput = useRef(null);
  const { setShowAgentEdit } = useUI();
  const [isSuggesting, setIsSuggesting] = useState(false);

  function onClose() {
    setShowAgentEdit(false);
  }

  function updateCurrentAgent(adjustments: Partial<Agent>) {
    updateAgent(agent.id, adjustments);
  }

  async function handleSuggestPersonality() {
    if (!agent.name.trim() || isSuggesting) return;

    setIsSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert character designer. Write a short, first-person personality description for a character named "${agent.name}". The description should be under 100 words and define their core traits, how they speak, and their general attitude.`,
      });
      const text = response.text;
      updateCurrentAgent({ personality: text });
    } catch (e) {
      console.error('Error suggesting personality:', e);
      alert(
        'There was an error suggesting a personality. Please check the console.'
      );
    } finally {
      setIsSuggesting(false);
    }
  }

  return (
    <Modal onClose={() => onClose()}>
      <div className="editAgent">
        <div>
          <form>
            <div>
              <input
                className="largeInput"
                type="text"
                placeholder="Name"
                value={agent.name}
                onChange={e => updateCurrentAgent({ name: e.target.value })}
                ref={nameInput}
              />
            </div>

            <div>
              <label>
                Personality
                <textarea
                  value={agent.personality}
                  onChange={e =>
                    updateCurrentAgent({ personality: e.target.value })
                  }
                  rows={7}
                  placeholder="How should I act? Whatʼs my purpose? How would you describe my personality?"
                />
              </label>
              <div className="personality-suggester">
                <button
                  type="button"
                  className="button"
                  onClick={handleSuggestPersonality}
                  disabled={!agent.name.trim() || isSuggesting}
                  aria-label="Suggest personality with AI"
                >
                  <span className="icon">auto_awesome</span>
                  {isSuggesting ? 'Thinking...' : 'Suggest with AI'}
                </button>
              </div>
            </div>
            <div className="archetypes">
              <label>Or start with an archetype</label>
              <div className="archetype-picker">
                {ARCHETYPES.map(({ name, personality }) => (
                  <button
                    type="button"
                    key={name}
                    onClick={() => updateCurrentAgent({ personality })}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div>
          <div>
            <ul className="colorPicker">
              {AGENT_COLORS.map((color, i) => (
                <li
                  key={i}
                  className={c({ active: color === agent.bodyColor })}
                >
                  <button
                    style={{ backgroundColor: color }}
                    onClick={() => updateCurrentAgent({ bodyColor: color })}
                    aria-label={`Set agent color to ${color}`}
                  />
                </li>
              ))}
            </ul>
          </div>
          <div className="voicePicker">
            Voice
            <select
              value={agent.voice}
              onChange={e => {
                updateCurrentAgent({
                  voice: e.target.value as INTERLOCUTOR_VOICE,
                });
              }}
            >
              {INTERLOCUTOR_VOICES.map(voice => (
                <option key={voice} value={voice}>
                  {voice}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={() => onClose()} className="button primary">
          Let’s go!
        </button>
      </div>
    </Modal>
  );
}