import React from 'react'
import { Modal } from 'semantic-ui-react';
import { closeModal } from './modalActions'
import { connect } from 'react-redux'
import TestForm from '../test/TestForm';

const actions = {
    closeModal
}

const TestModel = ({closeModal}) => {
  return (
        <Modal size="small" closeIcon="close" open={true} onClose={closeModal}>
          <Modal.Header>Test Modal</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <TestForm />
            </Modal.Description>
          </Modal.Content>
        </Modal>
  )
}

export default connect(null, actions)(TestModel)
