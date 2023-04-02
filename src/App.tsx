import { Component, createSignal } from 'solid-js';
import Box from './Components/General/Box/Box';
import Button from './Components/General/Button/Button';

import Steps, { Step } from './Components/Navigation/Steps/Steps';

const App: Component = () => {
  const [currentStep, setCurrentStep] = createSignal<number>(1);

  return (<>
    <Steps current={currentStep} identification='Testing steps'>
      <Step>First</Step>
      <Step>Second</Step>
      <Step>Last</Step>
    </Steps>
    <Button onClick={() => setCurrentStep(currentStep() + 1)}>Next</Button>
    <Button onClick={() => setCurrentStep(currentStep() - 1)}>Previous</Button>

    <Box>
      <h1>Box 1</h1>
      <Box>
        <h2>Box 2</h2>
        <Box>
          <h3>Box 3</h3>
          <Box>
            <h3>Box 4</h3>
            <Box>
              <h3>Box 4</h3>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  </>);
};

export default App;
