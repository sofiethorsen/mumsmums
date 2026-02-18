import React from 'react'
import styles from './StepsEditor.module.css'

interface StepsEditorProps {
    steps: string[]
    onChange: (steps: string[]) => void
}

const StepsEditor: React.FC<StepsEditorProps> = ({ steps, onChange }) => {
    const addStep = () => onChange([...steps, ''])

    const removeStep = (index: number) => {
        onChange(steps.filter((_, i) => i !== index))
    }

    const updateStep = (index: number, value: string) => {
        const newSteps = [...steps]
        newSteps[index] = value
        onChange(newSteps)
    }

    return (
        <div className={styles.section}>
            <h3>Steg</h3>
            {steps.map((step, index) => (
                <div key={index} className={styles.step}>
                    <span className={styles.stepNumber}>{index + 1}.</span>
                    <textarea
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        rows={2}
                        placeholder="Beskrivning"
                        className={styles.stepInput}
                    />
                    {steps.length > 1 && (
                        <button type="button" onClick={() => removeStep(index)} className={styles.removeButton}>
                            ✕
                        </button>
                    )}
                </div>
            ))}
            <button type="button" onClick={addStep} className={styles.addButton}>
                Lägg till steg
            </button>
        </div>
    )
}

export default StepsEditor
