import * as THREE from 'three'
import { keys } from './core/input'

// SCENE
const scene = new THREE.Scene()

// CAMERA
const aspect =
  window.innerWidth /
  window.innerHeight

const camera =
  new THREE.OrthographicCamera(
    -5 * aspect,
    5 * aspect,
    5,
    -5,
    0.1,
    1000
  )


camera.position.z = 10

// RENDERER
const renderer = new THREE.WebGLRenderer({
  antialias: true
})

renderer.setSize(
  window.innerWidth,
  window.innerHeight
)

document.body.appendChild(
  renderer.domElement
)

// PLAYER
const shape = new THREE.Shape()

shape.moveTo(-0.25, 0.15)
shape.lineTo(-0.25, -0.15)
shape.lineTo(0.25, 0)

const geometry =
  new THREE.ShapeGeometry(shape)

const material =
  new THREE.MeshBasicMaterial({
    color: 0x00ff00
  })

const cube = new THREE.Mesh(
  geometry,
  material
)

scene.add(cube)

// START POSITION
cube.position.set(4, -3, 0)

// MOVEMENT VARIABLES
const direction = new THREE.Vector2()

const velocity = new THREE.Vector2()

let angle = 0

const acceleration = 0.0015
const friction = 0.985
const turnSpeed = 0.04
const maxSpeed = 0.12

// WALL STORAGE
const walls: THREE.Mesh[] = []

// CREATE WALL FUNCTION
function createWall(
  x: number,
  y: number,
  width: number,
  height: number
) {

  const geometry =
    new THREE.BoxGeometry(
      width,
      height,
      0.5
    )

  const material =
    new THREE.MeshBasicMaterial({
      color: 0xffffff
    })

  const wall = new THREE.Mesh(
    geometry,
    material
  )

  wall.position.set(x, y, 0)

  scene.add(wall)

  walls.push(wall)
}

// MAZE WALLS

// borders
createWall(0, 5, 10, 0.3)
createWall(0, -5, 10, 0.3)
createWall(-5, 0, 0.3, 10)
createWall(5, 0, 0.3, 10)

// inner walls
createWall(0, -3, 6, 0.3)
createWall(-2, 0, 0.3, 6)
createWall(2, 2, 4, 0.3)
createWall(1, -1, 0.3, 4)
createWall(-1, 3, 4, 0.3)

// FINISH POINT
const finishGeometry =
  new THREE.BoxGeometry(
    0.5,
    0.5,
    0.5
  )

const finishMaterial =
  new THREE.MeshBasicMaterial({
    color: 0xff0000
  })

const finish = new THREE.Mesh(
  finishGeometry,
  finishMaterial
)

finish.position.set(-4, 4, 0)

scene.add(finish)

// GAME LOOP
function animate() {

  requestAnimationFrame(animate)

  // SPEED
  const currentSpeed =
    velocity.length()

  // STEERING
  const steeringStrength =
    0.2 +
    Math.min(currentSpeed * 4, 1)

  // FORWARD DIRECTION
  direction.x = Math.cos(angle)
  direction.y = Math.sin(angle)

  // DETECT FORWARD / REVERSE
  const forwardVelocity =
    velocity.x * direction.x +
    velocity.y * direction.y

  const steeringDirection =
    forwardVelocity >= 0 ? 1 : -1

  // ROTATION
  if (keys['a']) {

    angle +=
      turnSpeed *
      steeringStrength *
      steeringDirection
  }

  if (keys['d']) {

    angle -=
      turnSpeed *
      steeringStrength *
      steeringDirection
  }

  // ACCELERATION
  if (keys['w']) {

    velocity.x +=
      direction.x * acceleration

    velocity.y +=
      direction.y * acceleration
  }

  // REVERSE
  if (keys['s']) {

    velocity.x -=
      direction.x * acceleration

    velocity.y -=
      direction.y * acceleration
  }

  // DRIFT STEERING
  if (velocity.length() > 0.001) {

    const moveDirection =
      forwardVelocity >= 0 ? 1 : -1

    const targetDirection =
      new THREE.Vector2(
        Math.cos(angle) *
          moveDirection,

        Math.sin(angle) *
          moveDirection
      )

    velocity.lerp(
      targetDirection.multiplyScalar(
        velocity.length()
      ),
      0.02
    )
  }

  // SPEED LIMIT
  if (velocity.length() > maxSpeed) {

    velocity.normalize()

    velocity.multiplyScalar(
      maxSpeed
    )
  }

  // FRICTION
  velocity.multiplyScalar(
    friction
  )

  // MOVE PLAYER
  cube.position.x += velocity.x
  cube.position.y += velocity.y

  // ROTATE PLAYER VISUALLY
  cube.rotation.z = angle

  // COLLISION
  const playerBox =
    new THREE.Box3()
      .setFromObject(cube)

  for (const wall of walls) {

    const wallBox =
      new THREE.Box3()
        .setFromObject(wall)

    if (
      playerBox.intersectsBox(
        wallBox
      )
    ) {

      // RESET PLAYER
      cube.position.set(
        4,
        -4,
        0
      )

      velocity.set(0, 0)

      angle = 0
    }
  }

  // FINISH CHECK
  const finishBox =
    new THREE.Box3()
      .setFromObject(finish)

  if (
    playerBox.intersectsBox(
      finishBox
    )
  ) {

    document.body.innerHTML = `
      <div style="
        color:white;
        font-size:60px;
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
        background:black;
      ">
        COMPLETED
      </div>
    `
  }

  renderer.render(
    scene,
    camera
  )
}

animate()