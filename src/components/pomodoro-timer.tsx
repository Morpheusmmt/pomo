import React, { useEffect, useState } from 'react';
import { useInterval } from '../hooks/use-interval';
import { Button } from './button';
import { Timer } from './timer';

import bellStart from '../sounds/src_sounds_bell-start.mp3';
import bellFinish from '../sounds/src_sounds_bell-finish.mp3';
import { secondsToTime } from '../utils/seconds-to-time';

const audioStartWorking = new Audio(bellFinish);
const audioStopWorking = new Audio(bellStart);

interface Props {
    pomodoroTime: number;
    shortRestTime: number;
    longRestTime: number;
    cycles: number;
}

export function PomodoroTimer(props: Props): JSX.Element {
    const [pomodoroTime, setPomodoroTime] = useState(props.pomodoroTime);
    const [shortRestTime, setShortRestTime] = useState(props.shortRestTime);
    const [longRestTime, setLongRestTime] = useState(props.longRestTime);
    const [cycles, setCycles] = useState(props.cycles);

    const [mainTime, setMainTime] = useState(pomodoroTime);
    const [timeCounting, setTimeCounting] = useState(false);
    const [working, setWorking] = useState(false);
    const [resting, setResting] = useState(false);
    const [cyclesQtdManager, setCyclesQtdManager] = useState(new Array(cycles).fill(true));

    const [completedCyles, setCompletedCycles] = useState(0);
    const [fullWorkingTime, setFullWorkingTime] = useState(0);
    const [numberOfPomodoros, setNumberOfPomodoros] = useState(0);

    useEffect(() => {
        if (working) document.body.classList.add('working');
        if (resting) document.body.classList.remove('working');

        if (mainTime <= 0) {
            if (working && cyclesQtdManager.length > 0) {
                configureRest(false);
                setCyclesQtdManager((prev) => prev.slice(0, -1));
            } else if (working && cyclesQtdManager.length <= 0) {
                configureRest(true);
                setCyclesQtdManager(new Array(cycles).fill(true));
                setCompletedCycles(completedCyles + 1);
            }

            if (working) {
                setNumberOfPomodoros(numberOfPomodoros + 1);
                setFullWorkingTime(fullWorkingTime + pomodoroTime);
            }

            if (resting) configureWork();
        }
    }, [working, resting, mainTime, cyclesQtdManager]);

    useInterval(() => {
        if (timeCounting) {
            setMainTime((prev) => prev - 1);
        }
    }, 1000);

    const configureWork = () => {
        setTimeCounting(true);
        setWorking(true);
        setResting(false);
        setMainTime(pomodoroTime);
        audioStartWorking.play();
    };

    const configureRest = (long: boolean) => {
        setTimeCounting(true);
        setWorking(false);
        setResting(true);

        setMainTime(long ? longRestTime : shortRestTime);
        audioStopWorking.play();
    };

    return (
        <div className="pomodoro">
            <h2>You are: {working ? 'working' : 'resting'}</h2>
            <Timer mainTime={mainTime} />

            {/* Configuração dos tempos */}
            <div className="settings">
                <label>
                    Pomodoro Time (min):
                    <input
                        type="number"
                        value={pomodoroTime / 60}
                        onChange={(e) => setPomodoroTime(Number(e.target.value) * 60)}
                    />
                </label>
                <label>
                    Short Rest Time (min):
                    <input
                        type="number"
                        value={shortRestTime / 60}
                        onChange={(e) => setShortRestTime(Number(e.target.value) * 60)}
                    />
                </label>
                <label>
                    Long Rest Time (min):
                    <input
                        type="number"
                        value={longRestTime / 60}
                        onChange={(e) => setLongRestTime(Number(e.target.value) * 60)}
                    />
                </label>
                <label>
                    Cycles:
                    <input
                        type="number"
                        value={cycles}
                        onChange={(e) => setCycles(Number(e.target.value))}
                    />
                </label>
            </div>

            <div className="controls">
                <Button text="Work" onClick={configureWork} />
                <Button text="Rest" onClick={() => configureRest(false)} />
                <Button
                    className={!working && !resting ? 'hidden' : ''}
                    text={timeCounting ? 'Pause' : 'Play'}
                    onClick={() => setTimeCounting(!timeCounting)}
                />
            </div>

            <div className="details">
                <p>Ciclos Concluídos: {completedCyles}</p>
                <p>Horas trabalhadas: {secondsToTime(fullWorkingTime)}</p>
                <p>Pomodoros concluídos: {numberOfPomodoros}</p>
            </div>
        </div>
    );
}
